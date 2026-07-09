export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Les données fournies sont invalides',
  [ErrorCode.AUTHENTICATION_ERROR]: 'Authentification requise',
  [ErrorCode.AUTHORIZATION_ERROR]: 'Accès non autorisé',
  [ErrorCode.NOT_FOUND]: 'Ressource introuvable',
  [ErrorCode.CONFLICT]: 'Conflit avec une ressource existante',
  [ErrorCode.BAD_REQUEST]: 'Requête invalide',
  [ErrorCode.INTERNAL_ERROR]: 'Erreur interne du serveur',
  [ErrorCode.DATABASE_ERROR]: 'Erreur de base de données',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Trop de requêtes, veuillez réessayer plus tard',
};
