import { randomUUID } from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from '../shared/errors/index.js';
import type { AccessTokenPayload } from '../modules/auth/auth.types.js';

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(
    { ...payload },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as SignOptions,
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
      throw AppError.unauthorized('Token invalide ou expiré');
    }

    const payload = decoded as unknown as AccessTokenPayload;

    if (!payload.sub || !payload.role || !payload.email) {
      throw AppError.unauthorized('Token invalide ou expiré');
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.unauthorized('Token invalide ou expiré');
  }
};

export const getRefreshTokenExpiryDate = (): Date => {
  const expiresIn = config.jwt.refreshExpiresIn;
  const now = new Date();

  const match = /^(\d+)([dhms])$/.exec(expiresIn);
  if (!match) {
    now.setDate(now.getDate() + 7);
    return now;
  }

  const value = parseInt(match[1] ?? '7', 10);
  const unit = match[2];

  switch (unit) {
    case 'd':
      now.setDate(now.getDate() + value);
      break;
    case 'h':
      now.setHours(now.getHours() + value);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + value);
      break;
    case 's':
      now.setSeconds(now.getSeconds() + value);
      break;
    default:
      now.setDate(now.getDate() + 7);
  }

  return now;
};

export const generateRefreshToken = (): string => {
  return randomUUID() + randomUUID();
};
