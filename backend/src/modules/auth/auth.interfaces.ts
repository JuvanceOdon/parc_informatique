import type { AuthenticatedUser, AuthTokens, LoginResponse, UserWithRoleRow } from './auth.types.js';
import type { RoleCode } from '../../shared/constants/roles.constants.js';

export interface IAuthRepository {
  findByIdentifiant(identifiant: string): Promise<UserWithRoleRow | null>;
  findByIdWithRole(id: number): Promise<UserWithRoleRow | null>;
  updateLastLogin(userId: number): Promise<void>;
  createRefreshToken(userId: number, tokenHash: string, expiresAt: Date): Promise<number>;
  findActiveRefreshTokens(userId: number): Promise<Array<{ id: number; tokenHash: string }>>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
  revokeAllUserTokens(userId: number): Promise<void>;
  findUserByRefreshTokenHash(tokenHash: string): Promise<UserWithRoleRow | null>;
}

export interface IAuthService {
  login(identifiant: string, motDePasse: string): Promise<LoginResponse>;
  logout(userId: number, refreshToken?: string): Promise<void>;
  refreshAccessToken(refreshToken: string): Promise<AuthTokens>;
  getProfile(userId: number): Promise<AuthenticatedUser>;
}

export type AuthorizedRoles = RoleCode | RoleCode[];
