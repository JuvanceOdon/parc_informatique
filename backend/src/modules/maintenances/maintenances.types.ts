import type {
  MaintenanceStatut,
  MaintenanceType,
} from '../../shared/constants/maintenance.constants.js';
import type { MaterielEtat, MaterielStatut } from '../../shared/constants/materiel.constants.js';

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
  statut: MaterielStatut;
  etat: MaterielEtat;
}

export interface TicketSummary {
  id: number;
  numeroTicket: string;
  titre: string;
}

export interface MaintenanceHistoriqueResponse {
  id: number;
  action: string;
  description: string | null;
  ancienneValeur: unknown;
  nouvelleValeur: unknown;
  utilisateur: UtilisateurSummary | null;
  createdAt: Date;
}

export interface MaintenanceResponse {
  id: number;
  numeroMaintenance: string;
  materiel: MaterielSummary;
  ticket: TicketSummary | null;
  type: MaintenanceType;
  statut: MaintenanceStatut;
  titre: string;
  description: string | null;
  diagnostic: string | null;
  solution: string | null;
  technicien: UtilisateurSummary | null;
  statutMaterielAvant: MaterielStatut | null;
  etatMaterielAvant: MaterielEtat | null;
  statutMaterielApres: MaterielStatut | null;
  etatMaterielApres: MaterielEtat | null;
  datePlanifiee: Date | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  cout: string | null;
  createdBy: UtilisateurSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceListQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface MaintenanceFilters {
  materielId?: number;
  ticketId?: number;
  technicienId?: number;
  type?: MaintenanceType;
  statut?: MaintenanceStatut;
  activeOnly?: boolean;
  search?: string;
}

export interface CreateMaintenanceInput {
  materielId: number;
  ticketId?: number | null;
  type: MaintenanceType;
  titre: string;
  description?: string | null;
  technicienId?: number | null;
  datePlanifiee?: string | null;
  cout?: number | null;
  demarrer?: boolean;
}

export interface UpdateMaintenanceInput {
  titre?: string;
  description?: string | null;
  technicienId?: number | null;
  datePlanifiee?: string | null;
  cout?: number | null;
  diagnostic?: string | null;
}

export interface DiagnosticMaintenanceInput {
  diagnostic: string;
}

export interface SolutionMaintenanceInput {
  solution: string;
  etatMaterielApres?: MaterielEtat;
  statutMaterielApres?: MaterielStatut;
  cout?: number | null;
}

export interface AnnulerMaintenanceInput {
  motif?: string | null;
}

export interface AddHistoriqueInput {
  maintenanceId: number;
  utilisateurId: number;
  action: string;
  description?: string | null;
  ancienneValeur?: unknown;
  nouvelleValeur?: unknown;
}

export interface MaintenanceRow {
  id: number;
  numeroMaintenance: string;
  materielId: number;
  materielCode: string;
  materielDesignation: string;
  materielNumeroSerie: string | null;
  materielStatut: string;
  materielEtat: string;
  ticketId: number | null;
  ticketNumero: string | null;
  ticketTitre: string | null;
  type: string;
  statut: string;
  titre: string;
  description: string | null;
  diagnostic: string | null;
  solution: string | null;
  technicienId: number | null;
  technicienMatricule: string | null;
  technicienNom: string | null;
  technicienPrenom: string | null;
  technicienEmail: string | null;
  statutMaterielAvant: string | null;
  etatMaterielAvant: string | null;
  statutMaterielApres: string | null;
  etatMaterielApres: string | null;
  datePlanifiee: Date | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  cout: string | null;
  createdById: number;
  createdByMatricule: string;
  createdByNom: string;
  createdByPrenom: string;
  createdByEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceHistoriqueRow {
  id: number;
  maintenanceId: number;
  action: string;
  description: string | null;
  ancienneValeur: unknown;
  nouvelleValeur: unknown;
  utilisateurId: number | null;
  utilisateurMatricule: string | null;
  utilisateurNom: string | null;
  utilisateurPrenom: string | null;
  utilisateurEmail: string | null;
  createdAt: Date;
}
