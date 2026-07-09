import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../../database/connection.js';
import { tickets } from '../../database/schema/tickets.schema.js';
import { ticketCommentaires } from '../../database/schema/ticket-commentaires.schema.js';
import { ticketPiecesJointes } from '../../database/schema/ticket-pieces-jointes.schema.js';
import { ticketHistorique } from '../../database/schema/ticket-historique.schema.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { services } from '../../database/schema/services.schema.js';
import { roles } from '../../database/schema/roles.schema.js';
import {
  TicketPriorite,
  TicketStatut,
} from '../../shared/constants/ticket.constants.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { buildTicketCode, parseTicketCodeSequence } from '../../utils/ticket-code.util.js';
import type { ITicketsRepository } from './tickets.interfaces.js';
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

const demandeur = alias(utilisateurs, 'demandeur');
const assignee = alias(utilisateurs, 'assignee');
const historiqueUser = alias(utilisateurs, 'historique_user');
const commentaireUser = alias(utilisateurs, 'commentaire_user');
const pieceUser = alias(utilisateurs, 'piece_user');

const ticketSelect = {
  id: tickets.id,
  numeroTicket: tickets.numeroTicket,
  titre: tickets.titre,
  description: tickets.description,
  materielId: tickets.materielId,
  materielCode: materiels.codeMateriel,
  materielDesignation: materiels.designation,
  materielNumeroSerie: materiels.numeroSerie,
  demandeurId: tickets.demandeurId,
  demandeurMatricule: demandeur.matricule,
  demandeurNom: demandeur.nom,
  demandeurPrenom: demandeur.prenom,
  demandeurEmail: demandeur.email,
  assigneeId: tickets.assigneeId,
  assigneeMatricule: assignee.matricule,
  assigneeNom: assignee.nom,
  assigneePrenom: assignee.prenom,
  assigneeEmail: assignee.email,
  serviceId: tickets.serviceId,
  serviceCode: services.code,
  serviceLibelle: services.libelle,
  priorite: tickets.priorite,
  statut: tickets.statut,
  dateResolution: tickets.dateResolution,
  dateFermeture: tickets.dateFermeture,
  commentairesCount: sql<number>`(
    SELECT COUNT(*)::int FROM ticket_commentaires
    WHERE ticket_commentaires.ticket_id = ${tickets.id}
  )`.as('commentaires_count'),
  piecesJointesCount: sql<number>`(
    SELECT COUNT(*)::int FROM ticket_pieces_jointes
    WHERE ticket_pieces_jointes.ticket_id = ${tickets.id}
  )`.as('pieces_jointes_count'),
  createdAt: tickets.createdAt,
  updatedAt: tickets.updatedAt,
};

const baseQuery = () =>
  db
    .select(ticketSelect)
    .from(tickets)
    .innerJoin(demandeur, eq(tickets.demandeurId, demandeur.id))
    .leftJoin(assignee, eq(tickets.assigneeId, assignee.id))
    .leftJoin(materiels, eq(tickets.materielId, materiels.id))
    .leftJoin(services, eq(tickets.serviceId, services.id));

const buildWhereClause = (filters: TicketFilters) => {
  const conditions = [];

  if (!filters.isStaff && filters.currentUserId !== undefined) {
    conditions.push(
      or(
        eq(tickets.demandeurId, filters.currentUserId),
        eq(tickets.assigneeId, filters.currentUserId),
      ),
    );
  }

  if (filters.mesTicketsOnly && filters.currentUserId !== undefined) {
    conditions.push(
      or(
        eq(tickets.demandeurId, filters.currentUserId),
        eq(tickets.assigneeId, filters.currentUserId),
      ),
    );
  }

  if (filters.statut !== undefined) {
    conditions.push(eq(tickets.statut, filters.statut));
  }

  if (filters.priorite !== undefined) {
    conditions.push(eq(tickets.priorite, filters.priorite));
  }

  if (filters.demandeurId !== undefined) {
    conditions.push(eq(tickets.demandeurId, filters.demandeurId));
  }

  if (filters.assigneeId !== undefined) {
    conditions.push(eq(tickets.assigneeId, filters.assigneeId));
  }

  if (filters.materielId !== undefined) {
    conditions.push(eq(tickets.materielId, filters.materielId));
  }

  if (filters.serviceId !== undefined) {
    conditions.push(eq(tickets.serviceId, filters.serviceId));
  }

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(tickets.numeroTicket, term),
        ilike(tickets.titre, term),
        ilike(tickets.description, term),
        ilike(demandeur.nom, term),
        ilike(demandeur.prenom, term),
        ilike(demandeur.matricule, term),
      ),
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

const getSortColumn = (sortBy: string) => {
  switch (sortBy) {
    case 'updatedAt':
      return tickets.updatedAt;
    case 'priorite':
      return tickets.priorite;
    case 'statut':
      return tickets.statut;
    case 'numeroTicket':
      return tickets.numeroTicket;
    case 'createdAt':
    default:
      return tickets.createdAt;
  }
};

export class TicketsRepository implements ITicketsRepository {
  async findAll(
    query: TicketListQuery,
    filters: TicketFilters,
  ): Promise<{ rows: TicketRow[]; total: number }> {
    const where = buildWhereClause(filters);
    const sortColumn = getSortColumn(query.sortBy ?? 'createdAt');
    const orderBy = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const offset = (query.page - 1) * query.limit;

    const listQuery = baseQuery();
    const countQuery = db
      .select({ total: count() })
      .from(tickets)
      .innerJoin(demandeur, eq(tickets.demandeurId, demandeur.id));

    const [rows, totalResult] = await Promise.all([
      (where ? listQuery.where(where) : listQuery)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(offset),
      where ? countQuery.where(where) : countQuery,
    ]);

    return { rows, total: totalResult[0]?.total ?? 0 };
  }

  async findById(id: number): Promise<TicketRow | null> {
    const [row] = await baseQuery().where(eq(tickets.id, id)).limit(1);
    return row ?? null;
  }

  async generateNextCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TKT-${year}-`;

    const [last] = await db
      .select({ numeroTicket: tickets.numeroTicket })
      .from(tickets)
      .where(ilike(tickets.numeroTicket, `${prefix}%`))
      .orderBy(desc(tickets.numeroTicket))
      .limit(1);

    const lastSequence = last ? parseTicketCodeSequence(last.numeroTicket, year) : 0;
    return buildTicketCode(year, lastSequence + 1);
  }

  async create(
    data: CreateTicketInput & {
      numeroTicket: string;
      demandeurId: number;
      serviceId: number | null;
      priorite: TicketPriorite;
    },
  ): Promise<TicketRow> {
    const [inserted] = await db
      .insert(tickets)
      .values({
        numeroTicket: data.numeroTicket,
        titre: data.titre,
        description: data.description,
        materielId: data.materielId ?? null,
        demandeurId: data.demandeurId,
        serviceId: data.serviceId,
        priorite: data.priorite,
        statut: TicketStatut.OUVERT,
      })
      .returning({ id: tickets.id });

    const created = await this.findById(inserted!.id);
    if (!created) throw new Error('Failed to retrieve created ticket');
    return created;
  }

  async update(id: number, data: UpdateTicketInput): Promise<TicketRow | null> {
    const updateData: Partial<typeof tickets.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.titre !== undefined) updateData.titre = data.titre;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.materielId !== undefined) updateData.materielId = data.materielId;
    if (data.serviceId !== undefined) updateData.serviceId = data.serviceId;

    await db.update(tickets).set(updateData).where(eq(tickets.id, id));
    return this.findById(id);
  }

  async updateStatut(
    id: number,
    statut: TicketStatut,
    dates: { dateResolution?: Date | null; dateFermeture?: Date | null },
  ): Promise<TicketRow | null> {
    await db
      .update(tickets)
      .set({
        statut,
        dateResolution: dates.dateResolution ?? null,
        dateFermeture: dates.dateFermeture ?? null,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, id));

    return this.findById(id);
  }

  async updatePriorite(id: number, priorite: TicketPriorite): Promise<TicketRow | null> {
    await db
      .update(tickets)
      .set({ priorite, updatedAt: new Date() })
      .where(eq(tickets.id, id));

    return this.findById(id);
  }

  async updateAssignee(id: number, assigneeId: number | null): Promise<TicketRow | null> {
    await db
      .update(tickets)
      .set({ assigneeId, updatedAt: new Date() })
      .where(eq(tickets.id, id));

    return this.findById(id);
  }

  async addHistorique(data: AddHistoriqueInput): Promise<void> {
    await db.insert(ticketHistorique).values({
      ticketId: data.ticketId,
      utilisateurId: data.utilisateurId,
      action: data.action,
      description: data.description ?? null,
      ancienneValeur: data.ancienneValeur ?? null,
      nouvelleValeur: data.nouvelleValeur ?? null,
    });
  }

  async getHistorique(ticketId: number): Promise<TicketHistoriqueRow[]> {
    return db
      .select({
        id: ticketHistorique.id,
        ticketId: ticketHistorique.ticketId,
        action: ticketHistorique.action,
        description: ticketHistorique.description,
        ancienneValeur: ticketHistorique.ancienneValeur,
        nouvelleValeur: ticketHistorique.nouvelleValeur,
        utilisateurId: ticketHistorique.utilisateurId,
        utilisateurMatricule: historiqueUser.matricule,
        utilisateurNom: historiqueUser.nom,
        utilisateurPrenom: historiqueUser.prenom,
        utilisateurEmail: historiqueUser.email,
        createdAt: ticketHistorique.createdAt,
      })
      .from(ticketHistorique)
      .leftJoin(historiqueUser, eq(ticketHistorique.utilisateurId, historiqueUser.id))
      .where(eq(ticketHistorique.ticketId, ticketId))
      .orderBy(desc(ticketHistorique.createdAt));
  }

  async addCommentaire(
    ticketId: number,
    data: AddTicketCommentaireInput & { utilisateurId: number },
  ): Promise<TicketCommentaireRow> {
    const [inserted] = await db
      .insert(ticketCommentaires)
      .values({
        ticketId,
        utilisateurId: data.utilisateurId,
        contenu: data.contenu,
      })
      .returning({ id: ticketCommentaires.id });

    const [row] = await db
      .select({
        id: ticketCommentaires.id,
        ticketId: ticketCommentaires.ticketId,
        contenu: ticketCommentaires.contenu,
        utilisateurId: ticketCommentaires.utilisateurId,
        utilisateurMatricule: commentaireUser.matricule,
        utilisateurNom: commentaireUser.nom,
        utilisateurPrenom: commentaireUser.prenom,
        utilisateurEmail: commentaireUser.email,
        createdAt: ticketCommentaires.createdAt,
      })
      .from(ticketCommentaires)
      .innerJoin(commentaireUser, eq(ticketCommentaires.utilisateurId, commentaireUser.id))
      .where(eq(ticketCommentaires.id, inserted!.id))
      .limit(1);

    if (!row) throw new Error('Failed to retrieve created commentaire');
    return row;
  }

  async getCommentaires(ticketId: number): Promise<TicketCommentaireRow[]> {
    return db
      .select({
        id: ticketCommentaires.id,
        ticketId: ticketCommentaires.ticketId,
        contenu: ticketCommentaires.contenu,
        utilisateurId: ticketCommentaires.utilisateurId,
        utilisateurMatricule: commentaireUser.matricule,
        utilisateurNom: commentaireUser.nom,
        utilisateurPrenom: commentaireUser.prenom,
        utilisateurEmail: commentaireUser.email,
        createdAt: ticketCommentaires.createdAt,
      })
      .from(ticketCommentaires)
      .innerJoin(commentaireUser, eq(ticketCommentaires.utilisateurId, commentaireUser.id))
      .where(eq(ticketCommentaires.ticketId, ticketId))
      .orderBy(asc(ticketCommentaires.createdAt));
  }

  async addPieceJointe(data: {
    ticketId: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedById: number;
  }): Promise<TicketPieceJointeRow> {
    const [inserted] = await db
      .insert(ticketPiecesJointes)
      .values(data)
      .returning({ id: ticketPiecesJointes.id });

    const piece = await this.findPieceJointeById(inserted!.id, data.ticketId);
    if (!piece) throw new Error('Failed to retrieve created piece jointe');
    return piece;
  }

  async getPiecesJointes(ticketId: number): Promise<TicketPieceJointeRow[]> {
    return db
      .select({
        id: ticketPiecesJointes.id,
        ticketId: ticketPiecesJointes.ticketId,
        filename: ticketPiecesJointes.filename,
        originalName: ticketPiecesJointes.originalName,
        mimeType: ticketPiecesJointes.mimeType,
        size: ticketPiecesJointes.size,
        uploadedById: ticketPiecesJointes.uploadedById,
        uploadedByMatricule: pieceUser.matricule,
        uploadedByNom: pieceUser.nom,
        uploadedByPrenom: pieceUser.prenom,
        uploadedByEmail: pieceUser.email,
        createdAt: ticketPiecesJointes.createdAt,
      })
      .from(ticketPiecesJointes)
      .innerJoin(pieceUser, eq(ticketPiecesJointes.uploadedById, pieceUser.id))
      .where(eq(ticketPiecesJointes.ticketId, ticketId))
      .orderBy(desc(ticketPiecesJointes.createdAt));
  }

  async findPieceJointeById(id: number, ticketId: number): Promise<TicketPieceJointeRow | null> {
    const [row] = await db
      .select({
        id: ticketPiecesJointes.id,
        ticketId: ticketPiecesJointes.ticketId,
        filename: ticketPiecesJointes.filename,
        originalName: ticketPiecesJointes.originalName,
        mimeType: ticketPiecesJointes.mimeType,
        size: ticketPiecesJointes.size,
        uploadedById: ticketPiecesJointes.uploadedById,
        uploadedByMatricule: pieceUser.matricule,
        uploadedByNom: pieceUser.nom,
        uploadedByPrenom: pieceUser.prenom,
        uploadedByEmail: pieceUser.email,
        createdAt: ticketPiecesJointes.createdAt,
      })
      .from(ticketPiecesJointes)
      .innerJoin(pieceUser, eq(ticketPiecesJointes.uploadedById, pieceUser.id))
      .where(and(eq(ticketPiecesJointes.id, id), eq(ticketPiecesJointes.ticketId, ticketId)))
      .limit(1);

    return row ?? null;
  }

  async deletePieceJointe(id: number): Promise<void> {
    await db.delete(ticketPiecesJointes).where(eq(ticketPiecesJointes.id, id));
  }

  async materielExists(id: number): Promise<boolean> {
    const [row] = await db
      .select({ id: materiels.id })
      .from(materiels)
      .where(and(eq(materiels.id, id), eq(materiels.actif, true)))
      .limit(1);
    return !!row;
  }

  async serviceExists(id: number): Promise<boolean> {
    const [row] = await db
      .select({ id: services.id })
      .from(services)
      .where(and(eq(services.id, id), eq(services.actif, true)))
      .limit(1);
    return !!row;
  }

  async utilisateurExists(id: number): Promise<boolean> {
    const [row] = await db
      .select({ id: utilisateurs.id })
      .from(utilisateurs)
      .where(and(eq(utilisateurs.id, id), eq(utilisateurs.actif, true)))
      .limit(1);
    return !!row;
  }

  async isTechnicienOrStaff(id: number): Promise<boolean> {
    const [row] = await db
      .select({ roleCode: roles.code })
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id))
      .where(and(eq(utilisateurs.id, id), eq(utilisateurs.actif, true)))
      .limit(1);

    if (!row) return false;

    return (
      row.roleCode === RoleCode.ADMIN ||
      row.roleCode === RoleCode.CHEF_SERVICE ||
      row.roleCode === RoleCode.TECHNICIEN
    );
  }
}

export const ticketsRepository = new TicketsRepository();
