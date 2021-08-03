export interface IRabbitMQConfig {
  consumer: string;
  exchange: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
}

export interface IIntegrationEvent {
  id?: string;
  name: string;
  data: Record<string, unknown>;
  createdDate?: Date;
}

interface IMsgFields {
  consumerTag: string;
  deliveryTag: number;
  redelivered: boolean;
  exchange: string;
  routingKey: string;
}

interface IMsgProperties {
  contentType: string;
  contentEncoding: string;
  headers: {
    'x-death': unknown[];
    'x-first-death-exchange': string;
    'x-first-death-queue': string;
    'x-first-death-reason': string;
  };
  deliveryMode: number;
  priority: unknown;
  correlationId: unknown;
  replyTo: unknown;
  expiration: unknown;
  messageId: unknown;
  timestamp: unknown;
  type: unknown;
  userId: unknown;
  appId: unknown;
  clusterId: unknown;
}

export interface IMsg {
  fields: IMsgFields;
  properties: IMsgProperties;
}

export interface IEventBus {
  unsubscribe: (eventName: string) => Promise<void>;
  subscribe: (
    eventName: string,
    listener: (event: IIntegrationEvent, done: (arg?: Error) => void, msg: IMsg) => void,
    options?: { noAck: boolean; retryCount: number }
  ) => Promise<void>;
  publish: (integrationEvent: IIntegrationEvent) => Promise<boolean>;
  connect: () => Promise<void>;
}
