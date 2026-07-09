import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/index.js';
import { ErrorCode, ErrorMessages } from '../shared/errors/error-codes.js';
import { logger } from '../utils/logger.js';
import { buildErrorResponse } from '../utils/response.util.js';
import { config } from '../config/index.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      code: err.code,
      message: err.message,
      path: req.path,
      method: req.method,
    });

    res.status(err.statusCode).json(
      buildErrorResponse(
        err.message,
        err.code,
        req.originalUrl,
        err.details?.map((d) => ({ field: d.field, message: d.message })),
      ),
    );
    return;
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.') || 'body',
      message: e.message,
    }));

    logger.warn('Validation error', { path: req.path, details });

    res.status(422).json(
      buildErrorResponse(
        ErrorMessages[ErrorCode.VALIDATION_ERROR],
        ErrorCode.VALIDATION_ERROR,
        req.originalUrl,
        details,
      ),
    );
    return;
  }

  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const message = config.app.isProduction
    ? ErrorMessages[ErrorCode.INTERNAL_ERROR]
    : err.message;

  res.status(500).json(
    buildErrorResponse(message, ErrorCode.INTERNAL_ERROR, req.originalUrl),
  );
};
