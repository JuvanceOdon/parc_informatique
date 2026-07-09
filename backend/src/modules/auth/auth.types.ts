import type { RoleCode } from '../../shared/constants/roles.constants.js';

export interface AccessTokenPayload {
  sub: number;
  matricule: string;
  email: string;
  role: RoleCode;
}

export interface AuthenticatedUser {
  id: number;
  matricule: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  role: {
    id: number;
    code: RoleCode;
    libelle: string;
  };
  serviceId: number | null;
  actif: boolean;
  derniereConnexion: Date | null;
}

export interface LoginInput {
  identifiant: string;
  motDePasse: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  tokens: AuthTokens;
}

export interface UserProfileResponse extends AuthenticatedUser {}

export interface UserWithRoleRow {
  id: number;
  matricule: string;
  email: string;
  motDePasse: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  roleId: number;
  serviceId: number | null;
  actif: boolean;
  derniereConnexion: Date | null;
  roleCode: string;
  roleLibelle: string;
}
