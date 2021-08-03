export enum ErrorStatus {
  ServerError = 500,
  AlreadyExistsError = 422,
  PermissionDeniedError = 403,
  NotFoundError = 404,
  UnauthorizedError = 401,
  ValidationError = 400
}

export enum ErrorMessage {
  ServerError = 'Server Error',
  AlreadyExistsError = 'Already Exists Error',
  PermissionDeniedError = 'Permission Denied Error',
  NotFoundError = 'Not Found Error',
  UnauthorizedError = 'Unauthorized Error',
  ValidationError = 'Validation Error'
}

export interface ErrorDetails {
  platform?: string;
  message?: string;
  status?: ErrorStatus;
  fields?: string[];
}

export class AppError extends Error {
  code: string;
  status: ErrorStatus;
  details: ErrorDetails;

  constructor(
    status: ErrorStatus = ErrorStatus.ServerError,
    message: string,
    details?: ErrorDetails,
    code?: string
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ServerError extends AppError {
  constructor(message: string = ErrorMessage.ServerError, details?: ErrorDetails) {
    super(ErrorStatus.ServerError, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = ErrorMessage.NotFoundError, details?: ErrorDetails) {
    super(ErrorStatus.NotFoundError, message, details);
  }
}

export class AlreadyExistsError extends AppError {
  constructor(message: string = ErrorMessage.AlreadyExistsError, details?: ErrorDetails) {
    super(ErrorStatus.AlreadyExistsError, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = ErrorMessage.UnauthorizedError, details?: ErrorDetails) {
    super(ErrorStatus.UnauthorizedError, message, details);
  }
}

export class PermissionDeniedError extends AppError {
  constructor(message: string = ErrorMessage.PermissionDeniedError, details?: ErrorDetails) {
    super(ErrorStatus.PermissionDeniedError, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = ErrorMessage.ValidationError, details?: ErrorDetails) {
    super(ErrorStatus.ValidationError, message, details);
  }
}
