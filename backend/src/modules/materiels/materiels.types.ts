import type {
  MaterielEtat,
  MaterielHistoriqueAction,
  MaterielStatut,
} from '../../shared/constants/materiel.constants.js';

export interface MaterielImageResponse {
  id: number;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  isPrincipal: boolean;
  createdAt: Date;
}

export interface CategorieSummary {
  id: number;
  code: string;
  libelle: string;
}

export interface ServiceSummary {
  id: number;
  code: string;
  libelle: string;
}

export interface MaterielResponse {
  id: number;
  codeMateriel: string;
  numeroSerie: string | null;
  designation: string;
  marque: string | null;
  modele: string | null;
  categorie: CategorieSummary;
  service: ServiceSummary | null;
  localisation: string | null;
  dateAcquisition: string | null;
  dateFinGarantie: string | null;
  garantieExpiree: boolean;
  garantieExpireBientot: boolean;
  statut: MaterielStatut;
  etat: MaterielEtat;
  description: string | null;
  actif: boolean;
  images: MaterielImageResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterielHistoriqueResponse {
  id: number;
  action: MaterielHistoriqueAction;
  description: string | null;
  ancienneValeur: Record<string, unknown> | null;
  nouvelleValeur: Record<string, unknown> | null;
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    matricule: string;
  } | null;
  createdAt: Date;
}

export interface MaterielListQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface MaterielFilters {
  search?: string;
  categorieId?: number;
  serviceId?: number;
  statut?: MaterielStatut;
  etat?: MaterielEtat;
  actif?: boolean;
  garantieExpiree?: boolean;
  garantieExpireBientot?: boolean;
}

export interface CreateMaterielInput {
  numeroSerie?: string | null;
  designation: string;
  marque?: string | null;
  modele?: string | null;
  categorieId: number;
  serviceId?: number | null;
  localisation?: string | null;
  dateAcquisition?: string | null;
  dateFinGarantie?: string | null;
  statut?: MaterielStatut;
  etat?: MaterielEtat;
  description?: string | null;
}

export interface UpdateMaterielInput {
  numeroSerie?: string | null;
  designation?: string;
  marque?: string | null;
  modele?: string | null;
  categorieId?: number;
  serviceId?: number | null;
  localisation?: string | null;
  dateAcquisition?: string | null;
  dateFinGarantie?: string | null;
  statut?: MaterielStatut;
  etat?: MaterielEtat;
  description?: string | null;
}

export interface MaterielRow {
  id: number;
  codeMateriel: string;
  numeroSerie: string | null;
  designation: string;
  marque: string | null;
  modele: string | null;
  categorieId: number;
  categorieCode: string;
  categorieLibelle: string;
  serviceId: number | null;
  serviceCode: string | null;
  serviceLibelle: string | null;
  localisation: string | null;
  dateAcquisition: string | null;
  dateFinGarantie: string | null;
  statut: string;
  etat: string;
  description: string | null;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QrCodeResponse {
  codeMateriel: string;
  qrCodeDataUrl: string;
}
