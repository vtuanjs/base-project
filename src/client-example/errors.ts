import { ServerError, ErrorDetails, ErrorStatus } from '../core/errors';

export class ClientError extends ServerError {
  constructor(message = 'Client Unknown error', details?: ErrorDetails) {
    super(undefined, {
      platform: 'client',
      status: ErrorStatus.ServerError,
      message,
      ...details
    });
  }
}

export class ClientInvalidArgError extends ServerError {
  constructor(message = 'Client Invalid arguments', details?: ErrorDetails) {
    super(undefined, {
      platform: 'client',
      status: ErrorStatus.ValidationError,
      message,
      ...details
    });
  }
}

export class ClientUnauthorizedError extends ServerError {
  constructor(message = 'Client Unauthorized', details?: ErrorDetails) {
    super(undefined, {
      platform: 'client',
      status: ErrorStatus.UnauthorizedError,
      message,
      ...details
    });
  }
}

export class ClientNotFoundError extends ServerError {
  constructor(message = 'Client Not found', details?: ErrorDetails) {
    super(undefined, {
      platform: 'client',
      status: ErrorStatus.NotFoundError,
      message,
      ...details
    });
  }
}

export class ClientAlreadyExistsError extends ServerError {
  constructor(message = 'Client Already exists', details?: ErrorDetails) {
    super(undefined, {
      platform: 'client',
      status: ErrorStatus.AlreadyExistsError,
      message,
      ...details
    });
  }
}

export class ClientPermissionDeniedError extends ServerError {
  constructor(message = 'Client Permission denied', details?: ErrorDetails) {
    super(undefined, {
      platform: 'client',
      status: ErrorStatus.PermissionDeniedError,
      message,
      ...details
    });
  }
}
