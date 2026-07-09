import type { Response } from 'express';
import type { ApiErrorResponse, ApiSuccessResponse, PaginationMeta } from '../shared/types/index.js';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Opération réussie',
  statusCode = 200,
  meta?: PaginationMeta,
): Response<ApiSuccessResponse<T>> => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Ressource créée avec succès') => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

export const buildErrorResponse = (
  message: string,
  code: string,
  path?: string,
  errors?: Array<{ field: string; message: string }>,
): ApiErrorResponse => {
  const response: ApiErrorResponse = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  if (path !== undefined) {
    response.path = path;
  }

  return response;
};
