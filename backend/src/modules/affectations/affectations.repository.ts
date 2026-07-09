import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNull,
  or,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../../database/connection.js';
import { affectations } from '../../database/schema/affectations.schema.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { services } from '../../database/schema/services.schema.js';
import {
  AffectationStatut,
} from '../../shared/constants/affectation.constants.js';
import type { IAffectationsRepository } from './affectations.interfaces.js';
import type {
  AffectationFilters,
  AffectationListQuery,
  AffectationRow,
  CreateAffectationInput,
  UpdateAffectationInput,
} from './affectations.types.js';

const affectePar = alias(utilisateurs, 'affecte_par');

const affectationSelect = {
  id: affectations.id,
  materielId: affectations.materielId,
  materielCode: materiels.codeMateriel,
  materielDesignation: materiels.designation,
  materielNumeroSerie: materiels.numeroSerie,
  utilisateurId: affectations.utilisateurId,
  utilisateurMatricule: utilisateurs.matricule,
  utilisateurNom: utilisateurs.nom,
  utilisateurPrenom: utilisateurs.prenom,
  utilisateurEmail: utilisateurs.email,
  serviceId: affectations.serviceId,
  serviceCode: services.code,
  serviceLibelle: services.libelle,
  localisation: affectations.localisation,
  dateDebut: affectations.dateDebut,
  dateFin: affectations.dateFin,
  statut: affectations.statut,
  motif: affectations.motif,
  affecteParId: affectations.affecteParId,
  affecteParMatricule: affectePar.matricule,
  affecteParNom: affectePar.nom,
  affecteParPrenom: affectePar.prenom,
  affecteParEmail: affectePar.email,
  createdAt: affectations.createdAt,
  updatedAt: affectations.updatedAt,
};

const baseQuery = () =>
  db
    .select(affectationSelect)
    .from(affectations)
    .innerJoin(materiels, eq(affectations.materielId, materiels.id))
    .innerJoin(utilisateurs, eq(affectations.utilisateurId, utilisateurs.id))
    .leftJoin(services, eq(affectations.serviceId, services.id))
    .leftJoin(affectePar, eq(affectations.affecteParId, affectePar.id));

const buildWhereClause = (filters: AffectationFilters) => {
  const conditions = [];

  if (filters.materielId !== undefined) {
    conditions.push(eq(affectations.materielId, filters.materielId));
  }

  if (filters.utilisateurId !== undefined) {
    conditions.push(eq(affectations.utilisateurId, filters.utilisateurId));
  }

  if (filters.serviceId !== undefined) {
    conditions.push(eq(affectations.serviceId, filters.serviceId));
  }

  if (filters.statut !== undefined) {
    conditions.push(eq(affectations.statut, filters.statut));
  }

  if (filters.activeOnly) {
    conditions.push(eq(affectations.statut, AffectationStatut.ACTIVE));
  }

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(materiels.codeMateriel, term),
        ilike(materiels.designation, term),
        ilike(utilisateurs.nom, term),
        ilike(utilisateurs.prenom, term),
        ilike(utilisateurs.matricule, term),
      ),
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

const getSortColumn = (sortBy: string) => {
  switch (sortBy) {
    case 'dateFin':
      return affectations.dateFin;
    case 'createdAt':
      return affectations.createdAt;
    case 'dateDebut':
    default:
      return affectations.dateDebut;
  }
};

export class AffectationsRepository implements IAffectationsRepository {
  async findAll(
    query: AffectationListQuery,
    filters: AffectationFilters,
  ): Promise<{ rows: AffectationRow[]; total: number }> {
    const where = buildWhereClause(filters);
    const sortColumn = getSortColumn(query.sortBy ?? 'dateDebut');
    const orderBy = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const offset = (query.page - 1) * query.limit;

    const listQuery = baseQuery();
    const countQuery = db
      .select({ total: count() })
      .from(affectations)
      .innerJoin(materiels, eq(affectations.materielId, materiels.id))
      .innerJoin(utilisateurs, eq(affectations.utilisateurId, utilisateurs.id));

    const [rows, totalResult] = await Promise.all([
      (where ? listQuery.where(where) : listQuery)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(offset),
      where ? countQuery.where(where) : countQuery,
    ]);

    return { rows, total: totalResult[0]?.total ?? 0 };
  }

  async findById(id: number): Promise<AffectationRow | null> {
    const [row] = await baseQuery().where(eq(affectations.id, id)).limit(1);
    return row ?? null;
  }

  async findActiveByMaterielId(materielId: number): Promise<AffectationRow | null> {
    const [row] = await baseQuery()
      .where(
        and(
          eq(affectations.materielId, materielId),
          eq(affectations.statut, AffectationStatut.ACTIVE),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async findByMaterielId(materielId: number): Promise<AffectationRow[]> {
    return baseQuery()
      .where(eq(affectations.materielId, materielId))
      .orderBy(desc(affectations.dateDebut));
  }

  async findByUtilisateurId(utilisateurId: number): Promise<AffectationRow[]> {
    return baseQuery()
      .where(eq(affectations.utilisateurId, utilisateurId))
      .orderBy(desc(affectations.dateDebut));
  }

  async create(
    data: CreateAffectationInput & {
      affecteParId: number;
      serviceId: number | null;
    },
  ): Promise<AffectationRow> {
    const [inserted] = await db
      .insert(affectations)
      .values({
        materielId: data.materielId,
        utilisateurId: data.utilisateurId,
        serviceId: data.serviceId,
        localisation: data.localisation ?? null,
        motif: data.motif ?? null,
        affecteParId: data.affecteParId,
        statut: AffectationStatut.ACTIVE,
      })
      .returning({ id: affectations.id });

    const created = await this.findById(inserted!.id);
    if (!created) throw new Error('Failed to retrieve created affectation');
    return created;
  }

  async closeAffectation(
    id: number,
    statut: AffectationStatut,
    motif?: string | null,
  ): Promise<AffectationRow | null> {
    await db
      .update(affectations)
      .set({
        statut,
        dateFin: new Date(),
        updatedAt: new Date(),
        ...(motif ? { motif } : {}),
      })
      .where(and(eq(affectations.id, id), isNull(affectations.dateFin)));

    return this.findById(id);
  }

  async update(id: number, data: UpdateAffectationInput): Promise<AffectationRow | null> {
    const updateData: Partial<typeof affectations.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.serviceId !== undefined) updateData.serviceId = data.serviceId;
    if (data.localisation !== undefined) updateData.localisation = data.localisation;
    if (data.motif !== undefined) updateData.motif = data.motif;

    await db.update(affectations).set(updateData).where(eq(affectations.id, id));
    return this.findById(id);
  }
}

export const affectationsRepository = new AffectationsRepository();
