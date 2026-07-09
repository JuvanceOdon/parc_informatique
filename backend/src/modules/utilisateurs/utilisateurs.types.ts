import type { RoleCode } from '../../shared/constants/roles.constants.js';

export interface UtilisateurResponse {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface UtilisateurListQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  actif?: boolean;
  roleId?: number;
}

export interface CreateUtilisateurInput {
  matricule: string;
  email: string;
  motDePasse: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  roleId: number;
  serviceId?: number | null;
}

export interface UpdateUtilisateurInput {
  matricule?: string;
  email?: string;
  motDePasse?: string;
  nom?: string;
  prenom?: string;
  telephone?: string | null;
  roleId?: number;
  serviceId?: number | null;
}

export interface UtilisateurRow {
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
  createdAt: Date;
  updatedAt: Date;
  roleCode: string;
  roleLibelle: string;
}

export interface UtilisateurFilters {
  search?: string;
  actif?: boolean;
  roleId?: number;
}
