import type {
  AddHistoriqueInput,
  AddTicketCommentaireInput,
  CreateTicketInput,
  TicketCommentaireRow,
  TicketFilters,
  TicketHistoriqueRow,
  TicketListQuery,
  TicketPieceJointeRow,
  TicketRow,
  UpdateTicketInput,
} from './tickets.types.js';
import type { TicketPriorite, TicketStatut } from '../../shared/constants/ticket.constants.js';

export interface ITicketsRepository {
  findAll(
    query: TicketListQuery,
    filters: TicketFilters,
  ): Promise<{ rows: TicketRow[]; total: number }>;
  findById(id: number): Promise<TicketRow | null>;
  generateNextCode(): Promise<string>;
  create(data: CreateTicketInput & {
    numeroTicket: string;
    demandeurId: number;
    serviceId: number | null;
    priorite: TicketPriorite;
  }): Promise<TicketRow>;
  update(id: number, data: UpdateTicketInput): Promise<TicketRow | null>;
  updateStatut(
    id: number,
    statut: TicketStatut,
    dates: { dateResolution?: Date | null; dateFermeture?: Date | null },
  ): Promise<TicketRow | null>;
  updatePriorite(id: number, priorite: TicketPriorite): Promise<TicketRow | null>;
  updateAssignee(id: number, assigneeId: number | null): Promise<TicketRow | null>;
  addHistorique(data: AddHistoriqueInput): Promise<void>;
  getHistorique(ticketId: number): Promise<TicketHistoriqueRow[]>;
  addCommentaire(
    ticketId: number,
    data: AddTicketCommentaireInput & { utilisateurId: number },
  ): Promise<TicketCommentaireRow>;
  getCommentaires(ticketId: number): Promise<TicketCommentaireRow[]>;
  addPieceJointe(data: {
    ticketId: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedById: number;
  }): Promise<TicketPieceJointeRow>;
  getPiecesJointes(ticketId: number): Promise<TicketPieceJointeRow[]>;
  findPieceJointeById(id: number, ticketId: number): Promise<TicketPieceJointeRow | null>;
  deletePieceJointe(id: number): Promise<void>;
  materielExists(id: number): Promise<boolean>;
  serviceExists(id: number): Promise<boolean>;
  utilisateurExists(id: number): Promise<boolean>;
  isTechnicienOrStaff(id: number): Promise<boolean>;
}
