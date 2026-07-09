import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNotNull,
  lt,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { categories } from '../../database/schema/categories.schema.js';
import { services } from '../../database/schema/services.schema.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { materielImages } from '../../database/schema/materiel-images.schema.js';
import { materielHistorique } from '../../database/schema/materiel-historique.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import {
  MaterielStatut,
  MaterielEtat,
  type MaterielHistoriqueAction,
} from '../../shared/constants/materiel.constants.js';
import { buildMaterielCode, parseMaterielCodeSequence } from '../../utils/materiel-code.util.js';
import type { IMaterielsRepository } from './materiels.interfaces.js';
import type {
  CreateMaterielInput,
  MaterielFilters,
  MaterielHistoriqueResponse,
  MaterielListQuery,
  MaterielRow,
  UpdateMaterielInput,
} from './materiels.types.js';

const materielSelect = {
  id: materiels.id,
  codeMateriel: materiels.codeMateriel,
  numeroSerie: materiels.numeroSerie,
  designation: materiels.designation,
  marque: materiels.marque,
  modele: materiels.modele,
  categorieId: materiels.categorieId,
  categorieCode: categories.code,
  categorieLibelle: categories.libelle,
  serviceId: materiels.serviceId,
  serviceCode: services.code,
  serviceLibelle: services.libelle,
  localisation: materiels.localisation,
  dateAcquisition: materiels.dateAcquisition,
  dateFinGarantie: materiels.dateFinGarantie,
  statut: materiels.statut,
  etat: materiels.etat,
  description: materiels.description,
  actif: materiels.actif,
  createdAt: materiels.createdAt,
  updatedAt: materiels.updatedAt,
};

const getToday = (): string => new Date().toISOString().slice(0, 10);

const getDateInDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const buildWhereClause = (filters: MaterielFilters) => {
  const conditions = [];
  const today = getToday();

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(materiels.codeMateriel, term),
        ilike(materiels.designation, term),
        ilike(materiels.numeroSerie, term),
        ilike(materiels.marque, term),
        ilike(materiels.modele, term),
        ilike(materiels.localisation, term),
      ),
    );
  }

  if (filters.categorieId !== undefined) {
    conditions.push(eq(materiels.categorieId, filters.categorieId));
  }

  if (filters.serviceId !== undefined) {
    conditions.push(eq(materiels.serviceId, filters.serviceId));
  }

  if (filters.statut !== undefined) {
    conditions.push(eq(materiels.statut, filters.statut));
  }

  if (filters.etat !== undefined) {
    conditions.push(eq(materiels.etat, filters.etat));
  }

  if (filters.actif !== undefined) {
    conditions.push(eq(materiels.actif, filters.actif));
  }

  if (filters.garantieExpiree) {
    conditions.push(
      and(isNotNull(materiels.dateFinGarantie), lt(materiels.dateFinGarantie, today)),
    );
  }

  if (filters.garantieExpireBientot) {
    conditions.push(
      and(
        isNotNull(materiels.dateFinGarantie),
        gte(materiels.dateFinGarantie, today),
        lte(materiels.dateFinGarantie, getDateInDays(30)),
      ),
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

const getSortColumn = (sortBy: string) => {
  switch (sortBy) {
    case 'codeMateriel':
      return materiels.codeMateriel;
    case 'designation':
      return materiels.designation;
    case 'dateAcquisition':
      return materiels.dateAcquisition;
    case 'dateFinGarantie':
      return materiels.dateFinGarantie;
    case 'createdAt':
    default:
      return materiels.createdAt;
  }
};

const baseFrom = () =>
  db
    .select(materielSelect)
    .from(materiels)
    .innerJoin(categories, eq(materiels.categorieId, categories.id))
    .leftJoin(services, eq(materiels.serviceId, services.id));

export class MaterielsRepository implements IMaterielsRepository {
  async findAll(
    query: MaterielListQuery,
    filters: MaterielFilters,
  ): Promise<{ rows: MaterielRow[]; total: number }> {
    const where = buildWhereClause(filters);
    const sortColumn = getSortColumn(query.sortBy ?? 'createdAt');
    const orderBy = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const offset = (query.page - 1) * query.limit;

    const listQuery = baseFrom();
    const countQuery = db.select({ total: count() }).from(materiels);

    const [rows, totalResult] = await Promise.all([
      (where ? listQuery.where(where) : listQuery)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(offset),
      where ? countQuery.where(where) : countQuery,
    ]);

    return { rows, total: totalResult[0]?.total ?? 0 };
  }

  async findById(id: number): Promise<MaterielRow | null> {
    const [row] = await baseFrom().where(eq(materiels.id, id)).limit(1);
    return row ?? null;
  }

  async findByCode(codeMateriel: string): Promise<MaterielRow | null> {
    const [row] = await baseFrom()
      .where(eq(materiels.codeMateriel, codeMateriel.toUpperCase()))
      .limit(1);
    return row ?? null;
  }

  async findByNumeroSerie(numeroSerie: string): Promise<MaterielRow | null> {
    const [row] = await baseFrom()
      .where(eq(materiels.numeroSerie, numeroSerie.trim()))
      .limit(1);
    return row ?? null;
  }

  async generateNextCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MAT-${year}-`;

    const [last] = await db
      .select({ codeMateriel: materiels.codeMateriel })
      .from(materiels)
      .where(sql`${materiels.codeMateriel} LIKE ${prefix + '%'}`)
      .orderBy(desc(materiels.codeMateriel))
      .limit(1);

    const lastSequence = last ? parseMaterielCodeSequence(last.codeMateriel, year) : 0;
    return buildMaterielCode(year, lastSequence + 1);
  }

  async create(data: CreateMaterielInput & { codeMateriel: string }): Promise<MaterielRow> {
    const [inserted] = await db
      .insert(materiels)
      .values({
        codeMateriel: data.codeMateriel,
        numeroSerie: data.numeroSerie?.trim() || null,
        designation: data.designation,
        marque: data.marque ?? null,
        modele: data.modele ?? null,
        categorieId: data.categorieId,
        serviceId: data.serviceId ?? null,
        localisation: data.localisation ?? null,
        dateAcquisition: data.dateAcquisition ?? null,
        dateFinGarantie: data.dateFinGarantie ?? null,
        statut: data.statut ?? MaterielStatut.EN_STOCK,
        etat: data.etat ?? MaterielEtat.BON,
        description: data.description ?? null,
        actif: true,
      })
      .returning({ id: materiels.id });

    const created = await this.findById(inserted!.id);
    if (!created) throw new Error('Failed to retrieve created materiel');
    return created;
  }

  async update(id: number, data: UpdateMaterielInput): Promise<MaterielRow | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.numeroSerie !== undefined) updateData.numeroSerie = data.numeroSerie?.trim() || null;
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.marque !== undefined) updateData.marque = data.marque;
    if (data.modele !== undefined) updateData.modele = data.modele;
    if (data.categorieId !== undefined) updateData.categorieId = data.categorieId;
    if (data.serviceId !== undefined) updateData.serviceId = data.serviceId;
    if (data.localisation !== undefined) updateData.localisation = data.localisation;
    if (data.dateAcquisition !== undefined) updateData.dateAcquisition = data.dateAcquisition;
    if (data.dateFinGarantie !== undefined) updateData.dateFinGarantie = data.dateFinGarantie;
    if (data.statut !== undefined) updateData.statut = data.statut;
    if (data.etat !== undefined) updateData.etat = data.etat;
    if (data.description !== undefined) updateData.description = data.description;

    await db.update(materiels).set(updateData).where(eq(materiels.id, id));
    return this.findById(id);
  }

  async setActif(id: number, actif: boolean): Promise<MaterielRow | null> {
    await db
      .update(materiels)
      .set({ actif, updatedAt: new Date() })
      .where(eq(materiels.id, id));
    return this.findById(id);
  }

  async categorieExists(id: number): Promise<boolean> {
    const [row] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.actif, true)))
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

  async addHistorique(data: {
    materielId: number;
    utilisateurId: number | null;
    action: MaterielHistoriqueAction;
    description?: string;
    ancienneValeur?: Record<string, unknown> | null;
    nouvelleValeur?: Record<string, unknown> | null;
  }): Promise<void> {
    await db.insert(materielHistorique).values({
      materielId: data.materielId,
      utilisateurId: data.utilisateurId,
      action: data.action,
      description: data.description ?? null,
      ancienneValeur: data.ancienneValeur ?? null,
      nouvelleValeur: data.nouvelleValeur ?? null,
    });
  }

  async getHistorique(materielId: number): Promise<MaterielHistoriqueResponse[]> {
    const rows = await db
      .select({
        id: materielHistorique.id,
        action: materielHistorique.action,
        description: materielHistorique.description,
        ancienneValeur: materielHistorique.ancienneValeur,
        nouvelleValeur: materielHistorique.nouvelleValeur,
        createdAt: materielHistorique.createdAt,
        utilisateurId: utilisateurs.id,
        utilisateurNom: utilisateurs.nom,
        utilisateurPrenom: utilisateurs.prenom,
        utilisateurMatricule: utilisateurs.matricule,
      })
      .from(materielHistorique)
      .leftJoin(utilisateurs, eq(materielHistorique.utilisateurId, utilisateurs.id))
      .where(eq(materielHistorique.materielId, materielId))
      .orderBy(desc(materielHistorique.createdAt));

    return rows.map((row) => ({
      id: row.id,
      action: row.action as MaterielHistoriqueResponse['action'],
      description: row.description,
      ancienneValeur: row.ancienneValeur as Record<string, unknown> | null,
      nouvelleValeur: row.nouvelleValeur as Record<string, unknown> | null,
      utilisateur: row.utilisateurId
        ? {
            id: row.utilisateurId,
            nom: row.utilisateurNom!,
            prenom: row.utilisateurPrenom!,
            matricule: row.utilisateurMatricule!,
          }
        : null,
      createdAt: row.createdAt,
    }));
  }

  async getImages(materielId: number) {
    return db
      .select({
        id: materielImages.id,
        filename: materielImages.filename,
        originalName: materielImages.originalName,
        mimeType: materielImages.mimeType,
        size: materielImages.size,
        isPrincipal: materielImages.isPrincipal,
        createdAt: materielImages.createdAt,
      })
      .from(materielImages)
      .where(eq(materielImages.materielId, materielId))
      .orderBy(desc(materielImages.isPrincipal), desc(materielImages.createdAt));
  }

  async addImage(data: {
    materielId: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    isPrincipal: boolean;
  }): Promise<number> {
    const [result] = await db
      .insert(materielImages)
      .values(data)
      .returning({ id: materielImages.id });
    return result?.id ?? 0;
  }

  async findImageById(imageId: number, materielId: number) {
    const [row] = await db
      .select({ id: materielImages.id, filename: materielImages.filename })
      .from(materielImages)
      .where(and(eq(materielImages.id, imageId), eq(materielImages.materielId, materielId)))
      .limit(1);
    return row ?? null;
  }

  async deleteImage(imageId: number): Promise<boolean> {
    const result = await db
      .delete(materielImages)
      .where(eq(materielImages.id, imageId))
      .returning({ id: materielImages.id });
    return result.length > 0;
  }

  async clearPrincipalImage(materielId: number): Promise<void> {
    await db
      .update(materielImages)
      .set({ isPrincipal: false })
      .where(eq(materielImages.materielId, materielId));
  }
}

export const materielsRepository = new MaterielsRepository();
