import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../shared/errors/index.js';
import { ErrorCode, ErrorMessages } from '../shared/errors/error-codes.js';

type RequestPart = 'body' | 'query' | 'params';

export const validate =
  <T>(schema: ZodSchema<T>, part: RequestPart = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.') || part,
        message: e.message,
      }));

      next(
        AppError.validation(ErrorMessages[ErrorCode.VALIDATION_ERROR], details),
      );
      return;
    }

    if (part === 'query') {
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req[part] = result.data as typeof req[typeof part];
    }
    next();
  };
