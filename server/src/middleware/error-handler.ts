import type { ErrorRequestHandler, RequestHandler } from 'express';

import type { AppConfig } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import type { ErrorEnvelope } from '../types/api.js';
import { isRecord } from '../utils/objects.js';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `No route matches ${request.method} ${request.path}.`));
};

export function createErrorHandler(config: AppConfig): ErrorRequestHandler {
  return (error: unknown, _request, response, _next) => {
    void _next;
    const appError = normalizeHttpError(error);
    const safeMessage =
      appError.expose || config.nodeEnv !== 'production'
        ? appError.message
        : 'An unexpected server error occurred.';
    const payload: ErrorEnvelope = {
      error: {
        code: appError.code,
        message: safeMessage,
        ...(appError.details !== undefined ? { details: appError.details } : {}),
      },
    };

    if (appError.statusCode >= 500 && config.nodeEnv !== 'test') {
      console.error(`[${appError.code}] ${appError.message}`);
    }
    response.status(appError.statusCode).json(payload);
  };
}

function normalizeHttpError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof SyntaxError && isRecord(error) && error.type === 'entity.parse.failed') {
    return new AppError(400, 'INVALID_JSON', 'The request body is not valid JSON.');
  }
  return new AppError(500, 'INTERNAL_SERVER_ERROR', 'An unexpected server error occurred.', {
    expose: false,
    cause: error,
  });
}
