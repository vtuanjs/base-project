import amqp from 'amqplib';
import EventEmitter from 'events';
import { IntegrationEvent } from './event';
import { ILogger } from '../logger';
import { IEventBus, IMsg, IIntegrationEvent, IRabbitMQConfig } from './interfaces';
import { waitByPromise } from '../helpers';

const WAITING_TIME_AMPLITUDE = 1000; // ms
const MAXIMUM_CONNECTION_RETRY_COUNT = 5;
const MAXIMUM_PUBLISHING_RETRY_COUNT = 5;
const NOT_CONNECTED = 0;
const CONNECTED = 1;

export class RabbitMQ implements IEventBus {
  consumer: string;
  exchange: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
  connectionStatus: number;
  connectionRetryAttempt: number;
  connection: amqp.Connection;
  subscriptions: any[];
  channel: amqp.Channel;

  logger: ILogger;
  eventEmitter: EventEmitter;

  constructor({
    config = {
      consumer: 'Example',
      exchange: 'ecample.event_bus',
      hostname: 'localhost',
      port: 5672,
      username: 'guest',
      password: 'guest'
    },
    logger = console,
    eventEmitter
  }: {
    config?: IRabbitMQConfig;
    logger?: ILogger;
    eventEmitter: EventEmitter;
  }) {
    this.logger = logger;
    this.eventEmitter = eventEmitter;

    this.consumer = config.consumer;
    this.exchange = config.exchange;
    this.hostname = config.hostname;
    this.port = config.port;
    this.username = config.username;
    this.password = config.password;
    this.connectionStatus = NOT_CONNECTED;
    this.connectionRetryAttempt = 0;
    this.connection = null;
    this.subscriptions = [];
  }

  async unsubscribe(eventName: string): Promise<void> {
    await this.createChannel();
    await this.channel.unbindQueue(this.consumer, this.exchange, eventName);
    this.eventEmitter.removeAllListeners(eventName);
  }

  async subscribe(
    eventName: string,
    listener: (event: IIntegrationEvent, done: (arg?: Error) => void, msg: IMsg) => void,
    options?: { noAck?: boolean; retryCount?: number }
  ): Promise<void> {
    this.logger.info(`Subscribing event ${eventName} with ${listener.name}`);

    options = Object.assign(
      {},
      {
        noAck: false,
        retryCount: 3
      },
      options
    );

    await this.createChannel();

    await this.channel.assertQueue(this.consumer);
    await this.channel.bindQueue(this.consumer, this.exchange, this.createRoutingKey(eventName));
    this.eventEmitter.on(eventName, listener);
    this.channel.consume(
      this.consumer,
      (msg: amqp.ConsumeMessage) => {
        try {
          this.logger.info(`Receiving RabbitMQ event`);
          const integrationEvent = new IntegrationEvent(JSON.parse(msg.content.toString()));
          this.logger.info(`Processing RabbitMQ event ${integrationEvent.name}`);
          this.eventEmitter.emit(
            integrationEvent.name,
            integrationEvent,
            (err: Error) => {
              try {
                if (err) {
                  if (+msg.fields.deliveryTag > options.retryCount) {
                    this.channel.nack(msg, false, false);
                    this.logger.warn(
                      `Failed to handle integration event ${integrationEvent.id} `,
                      err
                    );
                  } else {
                    this.channel.nack(msg);
                    this.logger.warn(
                      `Failed to handle integration event ${integrationEvent.id} `,
                      err
                    );
                  }
                } else {
                  this.channel.ack(msg);
                  this.logger.info(`Handle successfully integration event ${integrationEvent.id}`);
                }
              } catch (error) {
                this.channel.nack(msg, false, false);
                this.logger.warn(
                  `Failed to handle integration event ${integrationEvent.id} `,
                  error
                );
              }
            },
            {
              fields: msg.fields,
              properties: msg.properties
            }
          );
        } catch (error) {
          this.logger.warn(`ERROR Processing message ${msg} `, error);
        }
      },
      options
    );
    this.subscriptions.push({ eventName, options });
  }

  async publish(integrationEvent: IIntegrationEvent): Promise<boolean> {
    let isPublished = false;
    for (
      let publishingRetryAttempt = 0;
      publishingRetryAttempt < MAXIMUM_PUBLISHING_RETRY_COUNT;
      publishingRetryAttempt++
    ) {
      try {
        this.logger.info(
          `Creating RabbitMQ channel to publish event: ${integrationEvent.id} (${integrationEvent.name})`
        );
        await this.createChannel();

        this.logger.info(`Publishing event to RabbitMQ: ${integrationEvent.id}`);
        isPublished = this.channel.publish(
          this.exchange,
          this.createRoutingKey(integrationEvent.name),
          Buffer.from(JSON.stringify(integrationEvent)),
          {
            mandatory: true,
            persistent: true
          }
        );
      } catch (error) {
        this.logger.warn(`Could not publish event: ${integrationEvent.id} `, error);
      }

      if (isPublished) {
        this.logger.info(`Published event to RabbitMQ: ${integrationEvent.id}`);
        return isPublished;
      } else {
        const waitingTime = publishingRetryAttempt * WAITING_TIME_AMPLITUDE;
        this.logger.info(
          `Re-publishing event to RabbitMQ : ${integrationEvent.id} after ${waitingTime} ms`
        );
        await waitByPromise(waitingTime);
      }
    }

    if (!isPublished) {
      this.logger.warn(
        `Could not publish event ${integrationEvent.id} after trying ${MAXIMUM_PUBLISHING_RETRY_COUNT} times`
      );
    }

    return isPublished;
  }

  private createRoutingKey(eventName: string) {
    return eventName;
  }

  async createChannel(): Promise<void> {
    if (!this.isConnected()) {
      await this.connect();
    }

    if (this.channel) {
      return;
    }

    this.channel = await this.connection.createChannel();
    this.channel.assertExchange(this.exchange, 'topic', { durable: true });
  }

  async connect(): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    if (!this.isConnected() && this.isExceededConnectionRetryAttempt()) {
      // throw new Error(`RabbitMQ Client could not connect`);
      process.exit(1);
    }

    try {
      this.logger.info(`RabbitMQ Client is trying to connect`);

      this.connection = await amqp.connect({
        hostname: this.hostname,
        port: this.port,
        username: this.username,
        password: this.password
      });
      this.connectionStatus = CONNECTED;
      this.connectionRetryAttempt = 0;

      this.logger.info(`RabbitMQ Client connected`);

      this.connection.on('error', async (error) => {
        this.logger.error(`RabbitMQ connections could not connect`, error);
        this.connectionStatus = NOT_CONNECTED;
        await waitByPromise(60000);
        await this.connect();
        this.resubscribe();
      });

      this.connection.on('close', async () => {
        this.logger.warn('RabbitMQ connections is close');
        this.connectionStatus = NOT_CONNECTED;
        await waitByPromise(60000);
        await this.connect();
        this.resubscribe();
      });
    } catch (error) {
      this.logger.error(error.message);
      this.connectionStatus = NOT_CONNECTED;
    }

    if (!this.isConnected()) {
      this.connectionRetryAttempt++;
      const waitingTime = this.connectionRetryAttempt * WAITING_TIME_AMPLITUDE;

      this.logger.info(`RabbitMQ client trying re-connect after ${waitingTime} ms`);

      await waitByPromise(waitingTime);
      await this.connect();
    }
  }

  private resubscribe() {
    if (this.subscriptions.length >= 1) {
      this.logger.info(`Resubscribe events at ${new Date().toISOString()}`);
      this.subscriptions.forEach((subscription) =>
        this.subscribe(subscription.eventName, null, subscription.options)
      );
    }
  }

  private isExceededConnectionRetryAttempt() {
    return this.connectionRetryAttempt > MAXIMUM_CONNECTION_RETRY_COUNT;
  }

  private isConnected() {
    return this.connectionStatus === CONNECTED;
  }
}
