import { AppError } from '../../shared/errors/index.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import {
  TicketHistoriqueAction,
  TicketPriorite,
  TicketStatut,
  canTransitionTicketStatut,
  isTicketTerminal,
} from '../../shared/constants/ticket.constants.js';
import {
  deleteTicketAttachmentFile,
  getTicketAttachmentUrl,
} from '../../middlewares/ticket-upload.middleware.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import type { ITicketsRepository } from './tickets.interfaces.js';
import type {
  AddTicketCommentaireInput,
  AssignTicketInput,
  ChangeTicketPrioriteInput,
  ChangeTicketStatutInput,
  CreateTicketInput,
  TicketCommentaireResponse,
  TicketDetailResponse,
  TicketFilters,
  TicketHistoriqueResponse,
  TicketListQuery,
  TicketPieceJointeResponse,
  TicketResponse,
  TicketRow,
  UpdateTicketInput,
} from './tickets.types.js';
import { ticketsRepository } from './tickets.repository.js';
import { notificationDispatcher } from '../notifications/notifications.dispatcher.js';

const STAFF_ROLES = new Set<RoleCode>([
  RoleCode.ADMIN,
  RoleCode.CHEF_SERVICE,
  RoleCode.TECHNICIEN,
]);

const EDITABLE_BY_DEMANDEUR_STATUTS = new Set<TicketStatut>([
  TicketStatut.OUVERT,
  TicketStatut.EN_ATTENTE,
]);

export class TicketsService {
  constructor(
    private readonly repository: ITicketsRepository = ticketsRepository,
  ) {}

  async list(
    query: TicketListQuery,
    filters: TicketFilters,
    user: AuthenticatedUser,
  ): Promise<{ data: TicketResponse[]; total: number }> {
    const isStaff = STAFF_ROLES.has(user.role.code);
    const enrichedFilters: TicketFilters = {
      ...filters,
      isStaff,
      currentUserId: user.id,
    };

    const { rows, total } = await this.repository.findAll(query, enrichedFilters);
    return { data: rows.map((row) => this.mapToResponse(row)), total };
  }

  async getById(id: number, user: AuthenticatedUser): Promise<TicketDetailResponse> {
    const ticket = await this.repository.findById(id);
    if (!ticket) throw AppError.notFound('Ticket introuvable');

    this.ensureCanAccess(ticket, user);

    const [commentaires, piecesJointes] = await Promise.all([
      this.repository.getCommentaires(id),
      this.repository.getPiecesJointes(id),
    ]);

    return {
      ...this.mapToResponse(ticket),
      commentaires: commentaires.map((row) => this.mapCommentaireToResponse(row)),
      piecesJointes: piecesJointes.map((row) => this.mapPieceJointeToResponse(row)),
    };
  }

  async create(input: CreateTicketInput, user: AuthenticatedUser): Promise<TicketResponse> {
    if (input.materielId) {
      const exists = await this.repository.materielExists(input.materielId);
      if (!exists) throw AppError.notFound('Matériel introuvable ou inactif');
    }

    let serviceId = input.serviceId ?? user.serviceId ?? null;
    if (serviceId) {
      const exists = await this.repository.serviceExists(serviceId);
      if (!exists) throw AppError.notFound('Service introuvable ou inactif');
    }

    const numeroTicket = await this.repository.generateNextCode();
    const priorite = input.priorite ?? TicketPriorite.MOYENNE;

    const created = await this.repository.create({
      ...input,
      numeroTicket,
      demandeurId: user.id,
      serviceId,
      priorite,
    });

    await this.repository.addHistorique({
      ticketId: created.id,
      utilisateurId: user.id,
      action: TicketHistoriqueAction.CREATION,
      description: `Création du ticket ${numeroTicket}`,
      nouvelleValeur: { titre: input.titre, priorite, statut: TicketStatut.OUVERT },
    });

    void notificationDispatcher.onTicketCreated({
      ticketId: created.id,
      numeroTicket,
      titre: input.titre,
      demandeurId: user.id,
    });

    return this.mapToResponse(created);
  }

  async update(
    id: number,
    input: UpdateTicketInput,
    user: AuthenticatedUser,
  ): Promise<TicketResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Ticket introuvable');

    this.ensureCanAccess(existing, user);
    this.ensureCanModify(existing, user);

    if (input.materielId) {
      const exists = await this.repository.materielExists(input.materielId);
      if (!exists) throw AppError.notFound('Matériel introuvable ou inactif');
    }

    if (input.serviceId) {
      const exists = await this.repository.serviceExists(input.serviceId);
      if (!exists) throw AppError.notFound('Service introuvable ou inactif');
    }

    const updated = await this.repository.update(id, input);
    if (!updated) throw AppError.notFound('Ticket introuvable');

    await this.repository.addHistorique({
      ticketId: id,
      utilisateurId: user.id,
      action: TicketHistoriqueAction.MODIFICATION,
      description: `Mise à jour du ticket ${existing.numeroTicket}`,
      ancienneValeur: {
        titre: existing.titre,
        materielId: existing.materielId,
        serviceId: existing.serviceId,
      },
      nouvelleValeur: input,
    });

    return this.mapToResponse(updated);
  }

  async changeStatut(
    id: number,
    input: ChangeTicketStatutInput,
    user: AuthenticatedUser,
  ): Promise<TicketResponse> {
    this.ensureIsStaff(user);

    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Ticket introuvable');

    const currentStatut = existing.statut as TicketStatut;
    const newStatut = input.statut;

    if (currentStatut === newStatut) {
      throw AppError.badRequest('Le ticket est déjà dans ce statut');
    }

    if (!canTransitionTicketStatut(currentStatut, newStatut)) {
      throw AppError.badRequest(
        `Transition de statut invalide : ${currentStatut} → ${newStatut}`,
      );
    }

    const now = new Date();
    const dates: { dateResolution?: Date | null; dateFermeture?: Date | null } = {};

    if (newStatut === TicketStatut.RESOLU) {
      dates.dateResolution = now;
    }

    if (newStatut === TicketStatut.FERME) {
      dates.dateFermeture = now;
      if (!existing.dateResolution) {
        dates.dateResolution = now;
      }
    }

    if (newStatut === TicketStatut.EN_COURS && !existing.assigneeId) {
      throw AppError.badRequest('Assignez un technicien avant de passer le ticket en cours');
    }

    const updated = await this.repository.updateStatut(id, newStatut, dates);
    if (!updated) throw AppError.notFound('Ticket introuvable');

    await this.repository.addHistorique({
      ticketId: id,
      utilisateurId: user.id,
      action: TicketHistoriqueAction.CHANGEMENT_STATUT,
      description: `Statut modifié : ${currentStatut} → ${newStatut}`,
      ancienneValeur: { statut: currentStatut },
      nouvelleValeur: { statut: newStatut },
    });

    if (input.commentaire?.trim()) {
      await this.addCommentaireInternal(id, { contenu: input.commentaire.trim() }, user);
    }

    return this.mapToResponse(updated);
  }

  async changePriorite(
    id: number,
    input: ChangeTicketPrioriteInput,
    user: AuthenticatedUser,
  ): Promise<TicketResponse> {
    this.ensureIsStaff(user);

    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Ticket introuvable');

    if (isTicketTerminal(existing.statut as TicketStatut)) {
      throw AppError.badRequest('Impossible de modifier la priorité d\'un ticket clôturé');
    }

    if (existing.priorite === input.priorite) {
      throw AppError.badRequest('Le ticket a déjà cette priorité');
    }

    const updated = await this.repository.updatePriorite(id, input.priorite);
    if (!updated) throw AppError.notFound('Ticket introuvable');

    await this.repository.addHistorique({
      ticketId: id,
      utilisateurId: user.id,
      action: TicketHistoriqueAction.CHANGEMENT_PRIORITE,
      description: `Priorité modifiée : ${existing.priorite} → ${input.priorite}`,
      ancienneValeur: { priorite: existing.priorite },
      nouvelleValeur: { priorite: input.priorite },
    });

    return this.mapToResponse(updated);
  }

  async assign(
    id: number,
    input: AssignTicketInput,
    user: AuthenticatedUser,
  ): Promise<TicketResponse> {
    this.ensureIsStaff(user);

    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Ticket introuvable');

    if (isTicketTerminal(existing.statut as TicketStatut)) {
      throw AppError.badRequest('Impossible d\'affecter un ticket clôturé');
    }

    if (input.assigneeId !== null) {
      const isStaffAssignee = await this.repository.isTechnicienOrStaff(input.assigneeId);
      if (!isStaffAssignee) {
        throw AppError.badRequest('Seul un technicien ou un responsable peut être assigné');
      }
    }

    if (existing.assigneeId === input.assigneeId) {
      throw AppError.badRequest('Le ticket est déjà assigné à cet utilisateur');
    }

    const updated = await this.repository.updateAssignee(id, input.assigneeId);
    if (!updated) throw AppError.notFound('Ticket introuvable');

    await this.repository.addHistorique({
      ticketId: id,
      utilisateurId: user.id,
      action: TicketHistoriqueAction.ASSIGNATION,
      description: input.assigneeId
        ? `Ticket assigné à l'utilisateur #${input.assigneeId}`
        : 'Assignation retirée',
      ancienneValeur: { assigneeId: existing.assigneeId },
      nouvelleValeur: { assigneeId: input.assigneeId },
    });

    return this.mapToResponse(updated);
  }

  async addCommentaire(
    id: number,
    input: AddTicketCommentaireInput,
    user: AuthenticatedUser,
  ): Promise<TicketCommentaireResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Ticket introuvable');

    this.ensureCanAccess(existing, user);

    if (isTicketTerminal(existing.statut as TicketStatut)) {
      throw AppError.badRequest('Impossible de commenter un ticket clôturé');
    }

    return this.addCommentaireInternal(id, input, user);
  }

  async getCommentaires(
    id: number,
    user: AuthenticatedUser,
  ): Promise<TicketCommentaireResponse[]> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Ticket introuvable');

    this.ensureCanAccess(existing, user);

    const rows = await this.repository.getCommentaires(id);
    return rows.map((row) => this.mapCommentaireToResponse(row));
  }

  async addPieceJointe(
    id: number,
    file: Express.Multer.File,
    user: AuthenticatedUser,
  ): Promise<TicketPieceJointeResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Ticket introuvable');

    this.ensureCanAccess(existing, user);

    if (isTicketTerminal(existing.statut as TicketStatut)) {
      throw AppError.badRequest('Impossible d\'ajouter une pièce jointe à un ticket clôturé');
    }

    const piece = await this.repository.addPieceJointe({
      ticketId: id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedById: user.id,
    });

    await this.repository.addHistorique({
      ticketId: id,
      utilisateurId: user.id,
      action: TicketHistoriqueAction.PIECE_JOINTE_AJOUT,
      description: `Ajout de la pièce jointe ${file.originalname}`,
    });

    return this.mapPieceJointeToResponse(piece);
  }

  async deletePieceJointe(
    ticketId: number,
    pieceId: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const existing = await this.repository.findById(ticketId);
    if (!existing) throw AppError.notFound('Ticket introuvable');

    this.ensureCanAccess(existing, user);

    const piece = await this.repository.findPieceJointeById(pieceId, ticketId);
    if (!piece) throw AppError.notFound('Pièce jointe introuvable');

    const isStaff = STAFF_ROLES.has(user.role.code);
    if (!isStaff && piece.uploadedById !== user.id) {
      throw AppError.forbidden('Vous ne pouvez supprimer que vos propres pièces jointes');
    }

    await this.repository.deletePieceJointe(pieceId);
    deleteTicketAttachmentFile(piece.filename);

    await this.repository.addHistorique({
      ticketId,
      utilisateurId: user.id,
      action: TicketHistoriqueAction.PIECE_JOINTE_SUPPRESSION,
      description: `Suppression de la pièce jointe ${piece.originalName}`,
    });
  }

  async getHistorique(
    id: number,
    user: AuthenticatedUser,
  ): Promise<TicketHistoriqueResponse[]> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Ticket introuvable');

    this.ensureCanAccess(existing, user);

    const rows = await this.repository.getHistorique(id);
    return rows.map((row) => this.mapHistoriqueToResponse(row));
  }

  private async addCommentaireInternal(
    id: number,
    input: AddTicketCommentaireInput,
    user: AuthenticatedUser,
  ): Promise<TicketCommentaireResponse> {
    const commentaire = await this.repository.addCommentaire(id, {
      ...input,
      utilisateurId: user.id,
    });

    await this.repository.addHistorique({
      ticketId: id,
      utilisateurId: user.id,
      action: TicketHistoriqueAction.COMMENTAIRE,
      description: 'Nouveau commentaire ajouté',
    });

    return this.mapCommentaireToResponse(commentaire);
  }

  private ensureIsStaff(user: AuthenticatedUser): void {
    if (!STAFF_ROLES.has(user.role.code)) {
      throw AppError.forbidden('Action réservée aux techniciens et responsables');
    }
  }

  private ensureCanAccess(ticket: TicketRow, user: AuthenticatedUser): void {
    if (STAFF_ROLES.has(user.role.code)) return;

    if (ticket.demandeurId !== user.id && ticket.assigneeId !== user.id) {
      throw AppError.forbidden('Accès non autorisé à ce ticket');
    }
  }

  private ensureCanModify(ticket: TicketRow, user: AuthenticatedUser): void {
    if (STAFF_ROLES.has(user.role.code)) return;

    if (ticket.demandeurId !== user.id) {
      throw AppError.forbidden('Seul le demandeur peut modifier ce ticket');
    }

    if (!EDITABLE_BY_DEMANDEUR_STATUTS.has(ticket.statut as TicketStatut)) {
      throw AppError.badRequest('Ce ticket ne peut plus être modifié par le demandeur');
    }
  }

  private mapToResponse(row: TicketRow): TicketResponse {
    return {
      id: row.id,
      numeroTicket: row.numeroTicket,
      titre: row.titre,
      description: row.description,
      materiel: row.materielId
        ? {
            id: row.materielId,
            codeMateriel: row.materielCode!,
            designation: row.materielDesignation!,
            numeroSerie: row.materielNumeroSerie,
          }
        : null,
      demandeur: {
        id: row.demandeurId,
        matricule: row.demandeurMatricule,
        nom: row.demandeurNom,
        prenom: row.demandeurPrenom,
        email: row.demandeurEmail,
      },
      assignee: row.assigneeId
        ? {
            id: row.assigneeId,
            matricule: row.assigneeMatricule!,
            nom: row.assigneeNom!,
            prenom: row.assigneePrenom!,
            email: row.assigneeEmail!,
          }
        : null,
      service: row.serviceId
        ? {
            id: row.serviceId,
            code: row.serviceCode!,
            libelle: row.serviceLibelle!,
          }
        : null,
      priorite: row.priorite as TicketPriorite,
      statut: row.statut as TicketStatut,
      dateResolution: row.dateResolution,
      dateFermeture: row.dateFermeture,
      commentairesCount: row.commentairesCount,
      piecesJointesCount: row.piecesJointesCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapCommentaireToResponse(
    row: import('./tickets.types.js').TicketCommentaireRow,
  ): TicketCommentaireResponse {
    return {
      id: row.id,
      contenu: row.contenu,
      utilisateur: {
        id: row.utilisateurId,
        matricule: row.utilisateurMatricule,
        nom: row.utilisateurNom,
        prenom: row.utilisateurPrenom,
        email: row.utilisateurEmail,
      },
      createdAt: row.createdAt,
    };
  }

  private mapPieceJointeToResponse(
    row: import('./tickets.types.js').TicketPieceJointeRow,
  ): TicketPieceJointeResponse {
    return {
      id: row.id,
      filename: row.filename,
      originalName: row.originalName,
      mimeType: row.mimeType,
      size: row.size,
      url: getTicketAttachmentUrl(row.filename),
      uploadedBy: {
        id: row.uploadedById,
        matricule: row.uploadedByMatricule,
        nom: row.uploadedByNom,
        prenom: row.uploadedByPrenom,
        email: row.uploadedByEmail,
      },
      createdAt: row.createdAt,
    };
  }

  private mapHistoriqueToResponse(
    row: import('./tickets.types.js').TicketHistoriqueRow,
  ): TicketHistoriqueResponse {
    return {
      id: row.id,
      action: row.action,
      description: row.description,
      ancienneValeur: row.ancienneValeur,
      nouvelleValeur: row.nouvelleValeur,
      utilisateur: row.utilisateurId
        ? {
            id: row.utilisateurId,
            matricule: row.utilisateurMatricule!,
            nom: row.utilisateurNom!,
            prenom: row.utilisateurPrenom!,
            email: row.utilisateurEmail!,
          }
        : null,
      createdAt: row.createdAt,
    };
  }
}

export const ticketsService = new TicketsService();
