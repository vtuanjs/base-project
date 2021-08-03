import { createClient, RedisClient } from 'redis';
import { promisify } from 'util';
import { ILogger } from '../logger';
import { ICache } from './interface';

let retryConnectAttempt = 0;

export class Redis implements ICache {
  client: RedisClient;
  getAsync: (key: string) => Promise<string>;

  setAsync: (
    key: string,
    value: string,
    mode?: 'EX' | 'PX' | 'KEEPTTL',
    duration?: number
  ) => Promise<unknown>;
  delAsync: (key: string) => Promise<number>;
  expireAsync: (key: string, second: number) => Promise<number>;
  incrByAsync: (key: string, increment: number) => Promise<number>;
  decrByAsync: (key: string, decrement: number) => Promise<number>;

  constructor(
    private host: string = '0.0.0.0',
    private port: number = 6379,
    private password: string = '',
    private logger: ILogger = console
  ) {
    this.client = createClient({
      host: this.host,
      port: this.port,
      password: this.password
    });

    this.listen();

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    this.incrByAsync = promisify(this.client.incrby).bind(this.client);
    this.decrByAsync = promisify(this.client.decrby).bind(this.client);
    this.expireAsync = promisify(this.client.expire).bind(this.client);
  }

  private listen() {
    this.client.on('error', (error: any) => {
      this.logger.error(error.message);
    });

    this.client.on('ready', () => {
      this.logger.info('Connected to Redis');
      retryConnectAttempt = 0;
    });

    this.client.on('connect', () => {
      this.logger.info('Connecting to Redis');
      retryConnectAttempt = 0;
    });

    this.client.on('reconnecting', () => {
      this.logger.info('Reconnecting to Redis');

      if (retryConnectAttempt > 10) {
        process.exit(1);
      }
      retryConnectAttempt++;
    });
  }
}
