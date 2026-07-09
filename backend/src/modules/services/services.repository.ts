import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
} from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { services } from '../../database/schema/services.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import type { IServicesRepository } from './services.interfaces.js';
import type {
  CreateServiceInput,
  ServiceFilters,
  ServiceListQuery,
  ServiceRow,
  UpdateServiceInput,
} from './services.types.js';

const serviceSelect = {
  id: services.id,
  code: services.code,
  libelle: services.libelle,
  description: services.description,
  responsableId: services.responsableId,
  actif: services.actif,
  createdAt: services.createdAt,
  updatedAt: services.updatedAt,
  responsableMatricule: utilisateurs.matricule,
  responsableNom: utilisateurs.nom,
  responsablePrenom: utilisateurs.prenom,
  responsableEmail: utilisateurs.email,
};

const buildWhereClause = (filters: ServiceFilters) => {
  const conditions = [];

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(services.code, term),
        ilike(services.libelle, term),
        ilike(services.description, term),
      ),
    );
  }

  if (filters.actif !== undefined) {
    conditions.push(eq(services.actif, filters.actif));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

const getSortColumn = (sortBy: string) => {
  switch (sortBy) {
    case 'code':
      return services.code;
    case 'libelle':
      return services.libelle;
    case 'createdAt':
    default:
      return services.createdAt;
  }
};

export class ServicesRepository implements IServicesRepository {
  async findAll(
    query: ServiceListQuery,
    filters: ServiceFilters,
  ): Promise<{ rows: ServiceRow[]; total: number }> {
    const where = buildWhereClause(filters);
    const sortColumn = getSortColumn(query.sortBy ?? 'createdAt');
    const orderBy = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const offset = (query.page - 1) * query.limit;

    const baseQuery = db
      .select(serviceSelect)
      .from(services)
      .leftJoin(utilisateurs, eq(services.responsableId, utilisateurs.id));

    const countQuery = db.select({ total: count() }).from(services);

    const [rows, totalResult] = await Promise.all([
      (where ? baseQuery.where(where) : baseQuery)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(offset),
      where ? countQuery.where(where) : countQuery,
    ]);

    return {
      rows,
      total: totalResult[0]?.total ?? 0,
    };
  }

  async findById(id: number): Promise<ServiceRow | null> {
    const [row] = await db
      .select(serviceSelect)
      .from(services)
      .leftJoin(utilisateurs, eq(services.responsableId, utilisateurs.id))
      .where(eq(services.id, id))
      .limit(1);

    return row ?? null;
  }

  async findByCode(code: string): Promise<ServiceRow | null> {
    const [row] = await db
      .select(serviceSelect)
      .from(services)
      .leftJoin(utilisateurs, eq(services.responsableId, utilisateurs.id))
      .where(eq(services.code, code.toUpperCase()))
      .limit(1);

    return row ?? null;
  }

  async create(data: CreateServiceInput): Promise<ServiceRow> {
    const [inserted] = await db
      .insert(services)
      .values({
        code: data.code.toUpperCase(),
        libelle: data.libelle,
        description: data.description ?? null,
        responsableId: data.responsableId ?? null,
        actif: true,
      })
      .returning({ id: services.id });

    const created = await this.findById(inserted!.id);
    if (!created) {
      throw new Error('Failed to retrieve created service');
    }

    return created;
  }

  async update(id: number, data: UpdateServiceInput): Promise<ServiceRow | null> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.code !== undefined) updateData.code = data.code.toUpperCase();
    if (data.libelle !== undefined) updateData.libelle = data.libelle;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.responsableId !== undefined) updateData.responsableId = data.responsableId;

    await db.update(services).set(updateData).where(eq(services.id, id));

    return this.findById(id);
  }

  async setActif(id: number, actif: boolean): Promise<ServiceRow | null> {
    await db
      .update(services)
      .set({ actif, updatedAt: new Date() })
      .where(eq(services.id, id));

    return this.findById(id);
  }

  async assignResponsable(
    id: number,
    responsableId: number | null,
  ): Promise<ServiceRow | null> {
    await db
      .update(services)
      .set({ responsableId, updatedAt: new Date() })
      .where(eq(services.id, id));

    return this.findById(id);
  }

  async countUsersInService(serviceId: number): Promise<number> {
    const [result] = await db
      .select({ total: count() })
      .from(utilisateurs)
      .where(eq(utilisateurs.serviceId, serviceId));

    return result?.total ?? 0;
  }
}

export const servicesRepository = new ServicesRepository();
