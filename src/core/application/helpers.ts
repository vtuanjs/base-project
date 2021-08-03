/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ErrorStatus, AppError } from '../errors';
import { Response } from 'express';

export function sendErrorResponse(e: any, res: Response): void {
  const error = createErrorResponse(e);
  res.status(error.status);

  res.json(error);
}

export function sendSuccessReponse(data: any, res: Response): void {
  res.json(data);
}

export function createErrorResponse(error: any): AppError {
  const err: any = {
    status: ErrorStatus.ServerError
  };

  if (!error) return err;

  const {
    message,
    code,
    status,
    details
  }: { message: string; code: string; status: number; details: any } = error as any;
  if (message) err.message = message;
  if (code) err.code = code;
  if (status) err.status = status;
  if (!details) return err;

  err.details = {};
  if (details.platform) err.details.platform = details.platform;
  if (details.message) err.details.message = details.message;
  if (details.status) err.details.status = details.status;
  if (details.fields) err.details.fields = details.fields;
  return err;
}
