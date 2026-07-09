import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../../database/connection.js';
import { maintenances } from '../../database/schema/maintenances.schema.js';
import { maintenanceHistorique } from '../../database/schema/maintenance-historique.schema.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { tickets } from '../../database/schema/tickets.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { roles } from '../../database/schema/roles.schema.js';
import { affectations } from '../../database/schema/affectations.schema.js';
import {
  MaintenanceStatut,
} from '../../shared/constants/maintenance.constants.js';
import { AffectationStatut } from '../../shared/constants/affectation.constants.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import {
  buildMaintenanceCode,
  parseMaintenanceCodeSequence,
} from '../../utils/maintenance-code.util.js';
import type { IMaintenancesRepository } from './maintenances.interfaces.js';
import type {
  AddHistoriqueInput,
  CreateMaintenanceInput,
  MaintenanceFilters,
  MaintenanceHistoriqueRow,
  MaintenanceListQuery,
  MaintenanceRow,
  UpdateMaintenanceInput,
} from './maintenances.types.js';
import type { MaterielEtat, MaterielStatut } from '../../shared/constants/materiel.constants.js';

const technicien = alias(utilisateurs, 'technicien');
const createdBy = alias(utilisateurs, 'created_by');
const historiqueUser = alias(utilisateurs, 'historique_user');

const ACTIVE_STATUTS = [
  MaintenanceStatut.PLANIFIEE,
  MaintenanceStatut.EN_COURS,
  MaintenanceStatut.DIAGNOSTIC,
];

const maintenanceSelect = {
  id: maintenances.id,
  numeroMaintenance: maintenances.numeroMaintenance,
  materielId: maintenances.materielId,
  materielCode: materiels.codeMateriel,
  materielDesignation: materiels.designation,
  materielNumeroSerie: materiels.numeroSerie,
  materielStatut: materiels.statut,
  materielEtat: materiels.etat,
  ticketId: maintenances.ticketId,
  ticketNumero: tickets.numeroTicket,
  ticketTitre: tickets.titre,
  type: maintenances.type,
  statut: maintenances.statut,
  titre: maintenances.titre,
  description: maintenances.description,
  diagnostic: maintenances.diagnostic,
  solution: maintenances.solution,
  technicienId: maintenances.technicienId,
  technicienMatricule: technicien.matricule,
  technicienNom: technicien.nom,
  technicienPrenom: technicien.prenom,
  technicienEmail: technicien.email,
  statutMaterielAvant: maintenances.statutMaterielAvant,
  etatMaterielAvant: maintenances.etatMaterielAvant,
  statutMaterielApres: maintenances.statutMaterielApres,
  etatMaterielApres: maintenances.etatMaterielApres,
  datePlanifiee: maintenances.datePlanifiee,
  dateDebut: maintenances.dateDebut,
  dateFin: maintenances.dateFin,
  cout: maintenances.cout,
  createdById: maintenances.createdById,
  createdByMatricule: createdBy.matricule,
  createdByNom: createdBy.nom,
  createdByPrenom: createdBy.prenom,
  createdByEmail: createdBy.email,
  createdAt: maintenances.createdAt,
  updatedAt: maintenances.updatedAt,
};

const baseQuery = () =>
  db
    .select(maintenanceSelect)
    .from(maintenances)
    .innerJoin(materiels, eq(maintenances.materielId, materiels.id))
    .leftJoin(tickets, eq(maintenances.ticketId, tickets.id))
    .leftJoin(technicien, eq(maintenances.technicienId, technicien.id))
    .innerJoin(createdBy, eq(maintenances.createdById, createdBy.id));

const buildWhereClause = (filters: MaintenanceFilters) => {
  const conditions = [];

  if (filters.materielId !== undefined) {
    conditions.push(eq(maintenances.materielId, filters.materielId));
  }

  if (filters.ticketId !== undefined) {
    conditions.push(eq(maintenances.ticketId, filters.ticketId));
  }

  if (filters.technicienId !== undefined) {
    conditions.push(eq(maintenances.technicienId, filters.technicienId));
  }

  if (filters.type !== undefined) {
    conditions.push(eq(maintenances.type, filters.type));
  }

  if (filters.statut !== undefined) {
    conditions.push(eq(maintenances.statut, filters.statut));
  }

  if (filters.activeOnly) {
    conditions.push(inArray(maintenances.statut, ACTIVE_STATUTS));
  }

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(maintenances.numeroMaintenance, term),
        ilike(maintenances.titre, term),
        ilike(materiels.codeMateriel, term),
        ilike(materiels.designation, term),
      ),
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

const getSortColumn = (sortBy: string) => {
  switch (sortBy) {
    case 'dateDebut':
      return maintenances.dateDebut;
    case 'dateFin':
      return maintenances.dateFin;
    case 'datePlanifiee':
      return maintenances.datePlanifiee;
    case 'numeroMaintenance':
      return maintenances.numeroMaintenance;
    case 'createdAt':
    default:
      return maintenances.createdAt;
  }
};

export class MaintenancesRepository implements IMaintenancesRepository {
  async findAll(
    query: MaintenanceListQuery,
    filters: MaintenanceFilters,
  ): Promise<{ rows: MaintenanceRow[]; total: number }> {
    const where = buildWhereClause(filters);
    const sortColumn = getSortColumn(query.sortBy ?? 'createdAt');
    const orderBy = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const offset = (query.page - 1) * query.limit;

    const listQuery = baseQuery();
    const countQuery = db
      .select({ total: count() })
      .from(maintenances)
      .innerJoin(materiels, eq(maintenances.materielId, materiels.id));

    const [rows, totalResult] = await Promise.all([
      (where ? listQuery.where(where) : listQuery)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(offset),
      where ? countQuery.where(where) : countQuery,
    ]);

    return { rows, total: totalResult[0]?.total ?? 0 };
  }

  async findById(id: number): Promise<MaintenanceRow | null> {
    const [row] = await baseQuery().where(eq(maintenances.id, id)).limit(1);
    return row ?? null;
  }

  async findActiveByMaterielId(materielId: number): Promise<MaintenanceRow | null> {
    const [row] = await baseQuery()
      .where(
        and(
          eq(maintenances.materielId, materielId),
          inArray(maintenances.statut, ACTIVE_STATUTS),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async findByMaterielId(materielId: number): Promise<MaintenanceRow[]> {
    return baseQuery()
      .where(eq(maintenances.materielId, materielId))
      .orderBy(desc(maintenances.createdAt));
  }

  async generateNextCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MNT-${year}-`;

    const [last] = await db
      .select({ numeroMaintenance: maintenances.numeroMaintenance })
      .from(maintenances)
      .where(ilike(maintenances.numeroMaintenance, `${prefix}%`))
      .orderBy(desc(maintenances.numeroMaintenance))
      .limit(1);

    const lastSequence = last ? parseMaintenanceCodeSequence(last.numeroMaintenance, year) : 0;
    return buildMaintenanceCode(year, lastSequence + 1);
  }

  async create(
    data: CreateMaintenanceInput & {
      numeroMaintenance: string;
      createdById: number;
      statut: MaintenanceStatut;
      statutMaterielAvant?: MaterielStatut | null;
      etatMaterielAvant?: MaterielEtat | null;
      dateDebut?: Date | null;
    },
  ): Promise<MaintenanceRow> {
    const [inserted] = await db
      .insert(maintenances)
      .values({
        numeroMaintenance: data.numeroMaintenance,
        materielId: data.materielId,
        ticketId: data.ticketId ?? null,
        type: data.type,
        statut: data.statut,
        titre: data.titre,
        description: data.description ?? null,
        technicienId: data.technicienId ?? null,
        statutMaterielAvant: data.statutMaterielAvant ?? null,
        etatMaterielAvant: data.etatMaterielAvant ?? null,
        datePlanifiee: data.datePlanifiee ? new Date(data.datePlanifiee) : null,
        dateDebut: data.dateDebut ?? null,
        cout: data.cout != null ? String(data.cout) : null,
        createdById: data.createdById,
      })
      .returning({ id: maintenances.id });

    const created = await this.findById(inserted!.id);
    if (!created) throw new Error('Failed to retrieve created maintenance');
    return created;
  }

  async update(id: number, data: UpdateMaintenanceInput): Promise<MaintenanceRow | null> {
    const updateData: Partial<typeof maintenances.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.titre !== undefined) updateData.titre = data.titre;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.technicienId !== undefined) updateData.technicienId = data.technicienId;
    if (data.datePlanifiee !== undefined) {
      updateData.datePlanifiee = data.datePlanifiee ? new Date(data.datePlanifiee) : null;
    }
    if (data.cout !== undefined) {
      updateData.cout = data.cout != null ? String(data.cout) : null;
    }
    if (data.diagnostic !== undefined) {
      updateData.diagnostic = data.diagnostic;
    }

    await db.update(maintenances).set(updateData).where(eq(maintenances.id, id));
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(maintenances).where(eq(maintenances.id, id)).returning({ id: maintenances.id });
    return result.length > 0;
  }

  async updateStatut(
    id: number,
    statut: MaintenanceStatut,
    dates: { dateDebut?: Date | null; dateFin?: Date | null },
  ): Promise<MaintenanceRow | null> {
    await db
      .update(maintenances)
      .set({
        statut,
        ...(dates.dateDebut !== undefined ? { dateDebut: dates.dateDebut } : {}),
        ...(dates.dateFin !== undefined ? { dateFin: dates.dateFin } : {}),
        updatedAt: new Date(),
      })
      .where(eq(maintenances.id, id));

    return this.findById(id);
  }

  async updateStatutWithSnapshots(
    id: number,
    statut: MaintenanceStatut,
    data: {
      dateDebut?: Date | null;
      dateFin?: Date | null;
      statutMaterielAvant: MaterielStatut;
      etatMaterielAvant: MaterielEtat;
    },
  ): Promise<MaintenanceRow | null> {
    await db
      .update(maintenances)
      .set({
        statut,
        statutMaterielAvant: data.statutMaterielAvant,
        etatMaterielAvant: data.etatMaterielAvant,
        ...(data.dateDebut !== undefined ? { dateDebut: data.dateDebut } : {}),
        ...(data.dateFin !== undefined ? { dateFin: data.dateFin } : {}),
        updatedAt: new Date(),
      })
      .where(eq(maintenances.id, id));

    return this.findById(id);
  }

  async updateDiagnostic(id: number, diagnostic: string): Promise<MaintenanceRow | null> {
    await db
      .update(maintenances)
      .set({
        diagnostic,
        statut: MaintenanceStatut.DIAGNOSTIC,
        updatedAt: new Date(),
      })
      .where(eq(maintenances.id, id));

    return this.findById(id);
  }

  async updateSolution(
    id: number,
    data: {
      solution: string;
      statutMaterielApres: MaterielStatut;
      etatMaterielApres: MaterielEtat;
      cout?: string | null;
      dateFin: Date;
    },
  ): Promise<MaintenanceRow | null> {
    await db
      .update(maintenances)
      .set({
        solution: data.solution,
        statut: MaintenanceStatut.TERMINEE,
        statutMaterielApres: data.statutMaterielApres,
        etatMaterielApres: data.etatMaterielApres,
        cout: data.cout ?? undefined,
        dateFin: data.dateFin,
        updatedAt: new Date(),
      })
      .where(eq(maintenances.id, id));

    return this.findById(id);
  }

  async addHistorique(data: AddHistoriqueInput): Promise<void> {
    await db.insert(maintenanceHistorique).values({
      maintenanceId: data.maintenanceId,
      utilisateurId: data.utilisateurId,
      action: data.action,
      description: data.description ?? null,
      ancienneValeur: data.ancienneValeur ?? null,
      nouvelleValeur: data.nouvelleValeur ?? null,
    });
  }

  async getHistorique(maintenanceId: number): Promise<MaintenanceHistoriqueRow[]> {
    return db
      .select({
        id: maintenanceHistorique.id,
        maintenanceId: maintenanceHistorique.maintenanceId,
        action: maintenanceHistorique.action,
        description: maintenanceHistorique.description,
        ancienneValeur: maintenanceHistorique.ancienneValeur,
        nouvelleValeur: maintenanceHistorique.nouvelleValeur,
        utilisateurId: maintenanceHistorique.utilisateurId,
        utilisateurMatricule: historiqueUser.matricule,
        utilisateurNom: historiqueUser.nom,
        utilisateurPrenom: historiqueUser.prenom,
        utilisateurEmail: historiqueUser.email,
        createdAt: maintenanceHistorique.createdAt,
      })
      .from(maintenanceHistorique)
      .leftJoin(historiqueUser, eq(maintenanceHistorique.utilisateurId, historiqueUser.id))
      .where(eq(maintenanceHistorique.maintenanceId, maintenanceId))
      .orderBy(desc(maintenanceHistorique.createdAt));
  }

  async materielExists(id: number): Promise<{ statut: string; etat: string } | null> {
    const [row] = await db
      .select({ statut: materiels.statut, etat: materiels.etat })
      .from(materiels)
      .where(and(eq(materiels.id, id), eq(materiels.actif, true)))
      .limit(1);
    return row ?? null;
  }

  async ticketExists(id: number): Promise<boolean> {
    const [row] = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);
    return !!row;
  }

  async technicienExists(id: number): Promise<boolean> {
    const [row] = await db
      .select({ id: utilisateurs.id })
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id))
      .where(
        and(
          eq(utilisateurs.id, id),
          eq(utilisateurs.actif, true),
          or(
            eq(roles.code, RoleCode.ADMIN),
            eq(roles.code, RoleCode.CHEF_SERVICE),
            eq(roles.code, RoleCode.TECHNICIEN),
          ),
        ),
      )
      .limit(1);
    return !!row;
  }

  async hasActiveAffectation(materielId: number): Promise<boolean> {
    const [row] = await db
      .select({ id: affectations.id })
      .from(affectations)
      .where(
        and(
          eq(affectations.materielId, materielId),
          eq(affectations.statut, AffectationStatut.ACTIVE),
        ),
      )
      .limit(1);
    return !!row;
  }
}

export const maintenancesRepository = new MaintenancesRepository();
