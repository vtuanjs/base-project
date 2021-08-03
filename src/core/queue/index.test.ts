import { describe, it } from 'mocha';
import { expect } from 'chai';
import { EventEmitter } from 'events';
import { IntegrationEvent, RabbitMQ, BaseEvent, IIntegrationEvent } from './index';

const user = {
  name: 'Nguyen Van Tuan',
  email: 'vantuan130393@gmail.com'
};

// Handle subscribe event
const USER_CREATED_EVENT = 'userCreated';
class UserEvent extends BaseEvent {
  constructor(private logger = console) {
    super();
  }

  async created(event: IIntegrationEvent, done: (arg?: Error) => void): Promise<void> {
    try {
      this.logger.info('Implement event', event);
      done();
    } catch (error) {
      done(error);
    }
  }
}

describe('PUBLISH event', () => {
  it('should be published event', async () => {
    // Main
    const eventEmitter = new EventEmitter();
    const eventBus = new RabbitMQ({ eventEmitter });

    const userEvent = new UserEvent();

    await eventBus.connect();
    // You can subscribe event from another service in Microservice Serivce System.
    await Promise.all([eventBus.subscribe(USER_CREATED_EVENT, userEvent.created)]);

    // Handle publised event in another file
    const userCreatedEvent = new IntegrationEvent({
      name: USER_CREATED_EVENT,
      data: user
    });

    const result = await eventBus.publish(userCreatedEvent);
    expect(result).to.eqls(true);
  });
});
