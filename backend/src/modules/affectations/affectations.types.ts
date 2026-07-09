import type { AffectationStatut } from '../../shared/constants/affectation.constants.js';

export interface UtilisateurSummary {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface MaterielSummary {
  id: number;
  codeMateriel: string;
  designation: string;
  numeroSerie: string | null;
}

export interface ServiceSummary {
  id: number;
  code: string;
  libelle: string;
}

export interface AffectationResponse {
  id: number;
  materiel: MaterielSummary;
  utilisateur: UtilisateurSummary;
  service: ServiceSummary | null;
  localisation: string | null;
  dateDebut: Date;
  dateFin: Date | null;
  statut: AffectationStatut;
  motif: string | null;
  affectePar: UtilisateurSummary | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AffectationListQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface AffectationFilters {
  materielId?: number;
  utilisateurId?: number;
  serviceId?: number;
  statut?: AffectationStatut;
  activeOnly?: boolean;
  search?: string;
}

export interface CreateAffectationInput {
  materielId: number;
  utilisateurId: number;
  serviceId?: number | null;
  localisation?: string | null;
  motif?: string | null;
}

export interface TransferAffectationInput {
  nouvelUtilisateurId: number;
  serviceId?: number | null;
  localisation?: string | null;
  motif?: string | null;
}

export interface TerminerAffectationInput {
  motif?: string | null;
}

export interface UpdateAffectationInput {
  serviceId?: number | null;
  localisation?: string | null;
  motif?: string | null;
}

export interface AffectationRow {
  id: number;
  materielId: number;
  materielCode: string;
  materielDesignation: string;
  materielNumeroSerie: string | null;
  utilisateurId: number;
  utilisateurMatricule: string;
  utilisateurNom: string;
  utilisateurPrenom: string;
  utilisateurEmail: string;
  serviceId: number | null;
  serviceCode: string | null;
  serviceLibelle: string | null;
  localisation: string | null;
  dateDebut: Date;
  dateFin: Date | null;
  statut: string;
  motif: string | null;
  affecteParId: number | null;
  affecteParMatricule: string | null;
  affecteParNom: string | null;
  affecteParPrenom: string | null;
  affecteParEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}
