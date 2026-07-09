import type { TicketPriorite, TicketStatut } from '../../shared/constants/ticket.constants.js';

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

export interface TicketCommentaireResponse {
  id: number;
  contenu: string;
  utilisateur: UtilisateurSummary;
  createdAt: Date;
}

export interface TicketPieceJointeResponse {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: UtilisateurSummary;
  createdAt: Date;
}

export interface TicketHistoriqueResponse {
  id: number;
  action: string;
  description: string | null;
  ancienneValeur: unknown;
  nouvelleValeur: unknown;
  utilisateur: UtilisateurSummary | null;
  createdAt: Date;
}

export interface TicketResponse {
  id: number;
  numeroTicket: string;
  titre: string;
  description: string;
  materiel: MaterielSummary | null;
  demandeur: UtilisateurSummary;
  assignee: UtilisateurSummary | null;
  service: ServiceSummary | null;
  priorite: TicketPriorite;
  statut: TicketStatut;
  dateResolution: Date | null;
  dateFermeture: Date | null;
  commentairesCount: number;
  piecesJointesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketDetailResponse extends TicketResponse {
  commentaires: TicketCommentaireResponse[];
  piecesJointes: TicketPieceJointeResponse[];
}

export interface TicketListQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface TicketFilters {
  statut?: TicketStatut;
  priorite?: TicketPriorite;
  demandeurId?: number;
  assigneeId?: number;
  materielId?: number;
  serviceId?: number;
  search?: string;
  mesTicketsOnly?: boolean;
  currentUserId?: number;
  isStaff?: boolean;
}

export interface CreateTicketInput {
  titre: string;
  description: string;
  materielId?: number | null;
  serviceId?: number | null;
  priorite?: TicketPriorite;
}

export interface UpdateTicketInput {
  titre?: string;
  description?: string;
  materielId?: number | null;
  serviceId?: number | null;
}

export interface ChangeTicketStatutInput {
  statut: TicketStatut;
  commentaire?: string | null;
}

export interface ChangeTicketPrioriteInput {
  priorite: TicketPriorite;
}

export interface AssignTicketInput {
  assigneeId: number | null;
}

export interface AddTicketCommentaireInput {
  contenu: string;
}

export interface TicketRow {
  id: number;
  numeroTicket: string;
  titre: string;
  description: string;
  materielId: number | null;
  materielCode: string | null;
  materielDesignation: string | null;
  materielNumeroSerie: string | null;
  demandeurId: number;
  demandeurMatricule: string;
  demandeurNom: string;
  demandeurPrenom: string;
  demandeurEmail: string;
  assigneeId: number | null;
  assigneeMatricule: string | null;
  assigneeNom: string | null;
  assigneePrenom: string | null;
  assigneeEmail: string | null;
  serviceId: number | null;
  serviceCode: string | null;
  serviceLibelle: string | null;
  priorite: string;
  statut: string;
  dateResolution: Date | null;
  dateFermeture: Date | null;
  commentairesCount: number;
  piecesJointesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketCommentaireRow {
  id: number;
  ticketId: number;
  contenu: string;
  utilisateurId: number;
  utilisateurMatricule: string;
  utilisateurNom: string;
  utilisateurPrenom: string;
  utilisateurEmail: string;
  createdAt: Date;
}

export interface TicketPieceJointeRow {
  id: number;
  ticketId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedById: number;
  uploadedByMatricule: string;
  uploadedByNom: string;
  uploadedByPrenom: string;
  uploadedByEmail: string;
  createdAt: Date;
}

export interface TicketHistoriqueRow {
  id: number;
  ticketId: number;
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

export interface AddHistoriqueInput {
  ticketId: number;
  utilisateurId: number;
  action: string;
  description?: string | null;
  ancienneValeur?: unknown;
  nouvelleValeur?: unknown;
}
