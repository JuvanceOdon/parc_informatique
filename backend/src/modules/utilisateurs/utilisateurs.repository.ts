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
import { roles } from '../../database/schema/roles.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import type { IUtilisateursRepository } from './utilisateurs.interfaces.js';
import type {
  CreateUtilisateurInput,
  UpdateUtilisateurInput,
  UtilisateurFilters,
  UtilisateurListQuery,
  UtilisateurRow,
} from './utilisateurs.types.js';

const userSelect = {
  id: utilisateurs.id,
  matricule: utilisateurs.matricule,
  email: utilisateurs.email,
  motDePasse: utilisateurs.motDePasse,
  nom: utilisateurs.nom,
  prenom: utilisateurs.prenom,
  telephone: utilisateurs.telephone,
  roleId: utilisateurs.roleId,
  serviceId: utilisateurs.serviceId,
  actif: utilisateurs.actif,
  derniereConnexion: utilisateurs.derniereConnexion,
  createdAt: utilisateurs.createdAt,
  updatedAt: utilisateurs.updatedAt,
  roleCode: roles.code,
  roleLibelle: roles.libelle,
};

const buildWhereClause = (filters: UtilisateurFilters) => {
  const conditions = [];

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(utilisateurs.nom, term),
        ilike(utilisateurs.prenom, term),
        ilike(utilisateurs.email, term),
        ilike(utilisateurs.matricule, term),
      ),
    );
  }

  if (filters.actif !== undefined) {
    conditions.push(eq(utilisateurs.actif, filters.actif));
  }

  if (filters.roleId !== undefined) {
    conditions.push(eq(utilisateurs.roleId, filters.roleId));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

const getSortColumn = (sortBy: string) => {
  switch (sortBy) {
    case 'nom':
      return utilisateurs.nom;
    case 'prenom':
      return utilisateurs.prenom;
    case 'email':
      return utilisateurs.email;
    case 'matricule':
      return utilisateurs.matricule;
    case 'createdAt':
    default:
      return utilisateurs.createdAt;
  }
};

export class UtilisateursRepository implements IUtilisateursRepository {
  async findAll(
    query: UtilisateurListQuery,
    filters: UtilisateurFilters,
  ): Promise<{ rows: UtilisateurRow[]; total: number }> {
    const where = buildWhereClause(filters);
    const sortColumn = getSortColumn(query.sortBy ?? 'createdAt');
    const orderBy = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const offset = (query.page - 1) * query.limit;

    const baseQuery = db
      .select(userSelect)
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id));

    const countQuery = db
      .select({ total: count() })
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id));

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

  async findById(id: number): Promise<UtilisateurRow | null> {
    const [row] = await db
      .select(userSelect)
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id))
      .where(eq(utilisateurs.id, id))
      .limit(1);

    return row ?? null;
  }

  async findByEmail(email: string): Promise<UtilisateurRow | null> {
    const [row] = await db
      .select(userSelect)
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id))
      .where(eq(utilisateurs.email, email.toLowerCase()))
      .limit(1);

    return row ?? null;
  }

  async findByMatricule(matricule: string): Promise<UtilisateurRow | null> {
    const [row] = await db
      .select(userSelect)
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id))
      .where(eq(utilisateurs.matricule, matricule.toUpperCase()))
      .limit(1);

    return row ?? null;
  }

  async create(data: CreateUtilisateurInput & { motDePasse: string }): Promise<UtilisateurRow> {
    const [inserted] = await db
      .insert(utilisateurs)
      .values({
        matricule: data.matricule.toUpperCase(),
        email: data.email.toLowerCase(),
        motDePasse: data.motDePasse,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone ?? null,
        roleId: data.roleId,
        serviceId: data.serviceId ?? null,
        actif: true,
      })
      .returning({ id: utilisateurs.id });

    const created = await this.findById(inserted!.id);
    if (!created) {
      throw new Error('Failed to retrieve created user');
    }

    return created;
  }

  async update(
    id: number,
    data: UpdateUtilisateurInput & { motDePasse?: string },
  ): Promise<UtilisateurRow | null> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.matricule !== undefined) updateData.matricule = data.matricule.toUpperCase();
    if (data.email !== undefined) updateData.email = data.email.toLowerCase();
    if (data.motDePasse !== undefined) updateData.motDePasse = data.motDePasse;
    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.prenom !== undefined) updateData.prenom = data.prenom;
    if (data.telephone !== undefined) updateData.telephone = data.telephone;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;
    if (data.serviceId !== undefined) updateData.serviceId = data.serviceId;

    await db.update(utilisateurs).set(updateData).where(eq(utilisateurs.id, id));

    return this.findById(id);
  }

  async setActif(id: number, actif: boolean): Promise<UtilisateurRow | null> {
    await db
      .update(utilisateurs)
      .set({ actif, updatedAt: new Date() })
      .where(eq(utilisateurs.id, id));

    return this.findById(id);
  }

  async countAdmins(): Promise<number> {
    const [result] = await db
      .select({ total: count() })
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id))
      .where(and(eq(roles.code, RoleCode.ADMIN), eq(utilisateurs.actif, true)));

    return result?.total ?? 0;
  }

  async roleExists(roleId: number): Promise<boolean> {
    const [role] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    return !!role;
  }
}

export const utilisateursRepository = new UtilisateursRepository();
