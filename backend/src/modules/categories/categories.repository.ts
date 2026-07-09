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
import { categories } from '../../database/schema/categories.schema.js';
import type { ICategoriesRepository } from './categories.interfaces.js';
import type {
  CategorieFilters,
  CategorieListQuery,
  CategorieRow,
  CreateCategorieInput,
  UpdateCategorieInput,
} from './categories.types.js';

const categorieSelect = {
  id: categories.id,
  code: categories.code,
  libelle: categories.libelle,
  description: categories.description,
  actif: categories.actif,
  createdAt: categories.createdAt,
  updatedAt: categories.updatedAt,
};

const buildWhereClause = (filters: CategorieFilters) => {
  const conditions = [];

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(categories.code, term),
        ilike(categories.libelle, term),
        ilike(categories.description, term),
      ),
    );
  }

  if (filters.actif !== undefined) {
    conditions.push(eq(categories.actif, filters.actif));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

const getSortColumn = (sortBy: string) => {
  switch (sortBy) {
    case 'code':
      return categories.code;
    case 'libelle':
      return categories.libelle;
    case 'createdAt':
    default:
      return categories.createdAt;
  }
};

export class CategoriesRepository implements ICategoriesRepository {
  async findAll(
    query: CategorieListQuery,
    filters: CategorieFilters,
  ): Promise<{ rows: CategorieRow[]; total: number }> {
    const where = buildWhereClause(filters);
    const sortColumn = getSortColumn(query.sortBy ?? 'createdAt');
    const orderBy = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const offset = (query.page - 1) * query.limit;

    const baseQuery = db.select(categorieSelect).from(categories);
    const countQuery = db.select({ total: count() }).from(categories);

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

  async findById(id: number): Promise<CategorieRow | null> {
    const [row] = await db
      .select(categorieSelect)
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return row ?? null;
  }

  async findByCode(code: string): Promise<CategorieRow | null> {
    const [row] = await db
      .select(categorieSelect)
      .from(categories)
      .where(eq(categories.code, code.toUpperCase()))
      .limit(1);

    return row ?? null;
  }

  async create(data: CreateCategorieInput): Promise<CategorieRow> {
    const [inserted] = await db
      .insert(categories)
      .values({
        code: data.code.toUpperCase(),
        libelle: data.libelle,
        description: data.description ?? null,
        actif: true,
      })
      .returning();

    return inserted!;
  }

  async update(id: number, data: UpdateCategorieInput): Promise<CategorieRow | null> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.code !== undefined) updateData.code = data.code.toUpperCase();
    if (data.libelle !== undefined) updateData.libelle = data.libelle;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.actif !== undefined) updateData.actif = data.actif;

    const [updated] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    return updated ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    return result.length > 0;
  }
}

export const categoriesRepository = new CategoriesRepository();
