import { IIntegrationEvent } from './interfaces';
import { generateTimestamp } from '../helpers';

export abstract class BaseEvent {
  constructor() {
    this.bindThisAllMethod();
  }

  private bindThisAllMethod(): void {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    methods
      .filter((method) => method !== 'constructor')
      .forEach((method) => {
        this[method] = this[method].bind(this);
      });
  }
}

export class IntegrationEvent implements IIntegrationEvent {
  id?: string;
  name: string;
  data: any;
  createdDate?: Date;

  constructor(event: IIntegrationEvent) {
    this.id = event.id || generateTimestamp().toString();
    this.name = event.name;
    this.data = event.data;
    this.createdDate = new Date();
  }
}
