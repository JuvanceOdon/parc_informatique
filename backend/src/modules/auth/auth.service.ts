import { AppError } from '../../shared/errors/index.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { config } from '../../config/index.js';
import { comparePassword } from '../../utils/password.util.js';
import {
  generateRefreshToken,
  getRefreshTokenExpiryDate,
  signAccessToken,
} from '../../utils/jwt.util.js';
import { hashToken } from '../../utils/token.util.js';
import type { IAuthRepository } from './auth.interfaces.js';
import type {
  AuthenticatedUser,
  AuthTokens,
  LoginResponse,
  UserWithRoleRow,
} from './auth.types.js';
import { authRepository } from './auth.repository.js';

export class AuthService {
  constructor(private readonly repository: IAuthRepository = authRepository) {}

  async login(identifiant: string, motDePasse: string): Promise<LoginResponse> {
    const user = await this.repository.findByIdentifiant(identifiant);

    if (!user) {
      throw AppError.unauthorized('Identifiants invalides');
    }

    if (!user.actif) {
      throw AppError.forbidden('Compte utilisateur désactivé');
    }

    const isPasswordValid = await comparePassword(motDePasse, user.motDePasse);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Identifiants invalides');
    }

    const tokens = await this.issueTokens(user);
    await this.repository.updateLastLogin(user.id);

    const profile = this.mapToAuthenticatedUser(user);
    profile.derniereConnexion = new Date();

    return { user: profile, tokens };
  }

  async logout(userId: number, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await this.repository.revokeRefreshToken(tokenHash);
      return;
    }

    await this.repository.revokeAllUserTokens(userId);
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = hashToken(refreshToken);
    const user = await this.repository.findUserByRefreshTokenHash(tokenHash);

    if (!user) {
      throw AppError.unauthorized('Refresh token invalide ou expiré');
    }

    if (!user.actif) {
      throw AppError.forbidden('Compte utilisateur désactivé');
    }

    await this.repository.revokeRefreshToken(tokenHash);
    return this.issueTokens(user);
  }

  async getProfile(userId: number): Promise<AuthenticatedUser> {
    const user = await this.repository.findByIdWithRole(userId);

    if (!user) {
      throw AppError.notFound('Utilisateur introuvable');
    }

    if (!user.actif) {
      throw AppError.forbidden('Compte utilisateur désactivé');
    }

    return this.mapToAuthenticatedUser(user);
  }

  private async issueTokens(user: UserWithRoleRow): Promise<AuthTokens> {
    const roleCode = user.roleCode as RoleCode;

    const accessToken = signAccessToken({
      sub: user.id,
      matricule: user.matricule,
      email: user.email,
      role: roleCode,
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await this.repository.createRefreshToken(user.id, tokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  }

  private mapToAuthenticatedUser(user: UserWithRoleRow): AuthenticatedUser {
    return {
      id: user.id,
      matricule: user.matricule,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      role: {
        id: user.roleId,
        code: user.roleCode as RoleCode,
        libelle: user.roleLibelle,
      },
      serviceId: user.serviceId,
      actif: user.actif,
      derniereConnexion: user.derniereConnexion,
    };
  }
}

export const authService = new AuthService();
