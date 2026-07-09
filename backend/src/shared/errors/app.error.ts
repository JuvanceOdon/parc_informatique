import { ErrorCode } from './error-codes.js';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: ValidationErrorDetail[];

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: ValidationErrorDetail[],
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code: ErrorCode = ErrorCode.BAD_REQUEST, details?: ValidationErrorDetail[]) {
    return new AppError(message, 400, code, details);
  }

  static validation(message: string, details?: ValidationErrorDetail[]) {
    return new AppError(message, 422, ErrorCode.VALIDATION_ERROR, details);
  }

  static unauthorized(message = 'Authentification requise') {
    return new AppError(message, 401, ErrorCode.AUTHENTICATION_ERROR);
  }

  static forbidden(message = 'Accès non autorisé') {
    return new AppError(message, 403, ErrorCode.AUTHORIZATION_ERROR);
  }

  static notFound(message = 'Ressource introuvable') {
    return new AppError(message, 404, ErrorCode.NOT_FOUND);
  }

  static conflict(message: string) {
    return new AppError(message, 409, ErrorCode.CONFLICT);
  }

  static internal(message = 'Erreur interne du serveur') {
    return new AppError(message, 500, ErrorCode.INTERNAL_ERROR, undefined, false);
  }

  static database(message = 'Erreur de base de données') {
    return new AppError(message, 500, ErrorCode.DATABASE_ERROR, undefined, false);
  }
}
