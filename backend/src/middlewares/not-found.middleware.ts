import type { Request, Response } from 'express';
import { ErrorCode, ErrorMessages } from '../shared/errors/error-codes.js';
import { buildErrorResponse } from '../utils/response.util.js';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(
    buildErrorResponse(
      ErrorMessages[ErrorCode.NOT_FOUND],
      ErrorCode.NOT_FOUND,
      req.originalUrl,
    ),
  );
};
