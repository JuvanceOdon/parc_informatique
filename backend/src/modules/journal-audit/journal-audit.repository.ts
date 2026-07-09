import { and, asc, count, desc, eq, gte, ilike, lte, or } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { journalAudit } from '../../database/schema/journal-audit.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import type {
  CreateJournalAuditInput,
  JournalAuditFilters,
  JournalAuditListQuery,
  JournalAuditRow,
} from './journal-audit.types.js';

const journalSelect = {
  id: journalAudit.id,
  utilisateurId: journalAudit.utilisateurId,
  utilisateurMatricule: utilisateurs.matricule,
  utilisateurNom: utilisateurs.nom,
  utilisateurPrenom: utilisateurs.prenom,
  utilisateurEmail: utilisateurs.email,
  action: journalAudit.action,
  categorie: journalAudit.categorie,
  description: journalAudit.description,
  entiteType: journalAudit.entiteType,
  entiteId: journalAudit.entiteId,
  ipAddress: journalAudit.ipAddress,
  userAgent: journalAudit.userAgent,
  metadonnees: journalAudit.metadonnees,
  createdAt: journalAudit.createdAt,
};

const buildWhereClause = (filters: JournalAuditFilters) => {
  const conditions = [];

  if (filters.action !== undefined) {
    conditions.push(eq(journalAudit.action, filters.action));
  }

  if (filters.categorie !== undefined) {
    conditions.push(eq(journalAudit.categorie, filters.categorie));
  }

  if (filters.utilisateurId !== undefined) {
    conditions.push(eq(journalAudit.utilisateurId, filters.utilisateurId));
  }

  if (filters.dateDebut !== undefined) {
    conditions.push(gte(journalAudit.createdAt, filters.dateDebut));
  }

  if (filters.dateFin !== undefined) {
    conditions.push(lte(journalAudit.createdAt, filters.dateFin));
  }

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(journalAudit.description, term),
        ilike(utilisateurs.matricule, term),
        ilike(utilisateurs.nom, term),
        ilike(utilisateurs.prenom, term),
        ilike(journalAudit.ipAddress, term),
      ),
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

const getSortColumn = (sortBy: string) => {
  switch (sortBy) {
    case 'action':
      return journalAudit.action;
    case 'categorie':
      return journalAudit.categorie;
    case 'createdAt':
    default:
      return journalAudit.createdAt;
  }
};

export class JournalAuditRepository {
  async create(input: CreateJournalAuditInput): Promise<void> {
    await db.insert(journalAudit).values({
      utilisateurId: input.utilisateurId ?? null,
      action: input.action,
      categorie: input.categorie,
      description: input.description,
      entiteType: input.entiteType ?? null,
      entiteId: input.entiteId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      metadonnees: input.metadonnees ?? null,
    });
  }

  async findAll(
    query: JournalAuditListQuery,
    filters: JournalAuditFilters,
  ): Promise<{ rows: JournalAuditRow[]; total: number }> {
    const where = buildWhereClause(filters);
    const sortColumn = getSortColumn(query.sortBy ?? 'createdAt');
    const orderBy = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const offset = (query.page - 1) * query.limit;

    const listQuery = db
      .select(journalSelect)
      .from(journalAudit)
      .leftJoin(utilisateurs, eq(journalAudit.utilisateurId, utilisateurs.id));

    const countQuery = db
      .select({ total: count() })
      .from(journalAudit)
      .leftJoin(utilisateurs, eq(journalAudit.utilisateurId, utilisateurs.id));

    const [rows, totalResult] = await Promise.all([
      (where ? listQuery.where(where) : listQuery)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(offset),
      where ? countQuery.where(where) : countQuery,
    ]);

    return { rows, total: totalResult[0]?.total ?? 0 };
  }

  async findById(id: number): Promise<JournalAuditRow | null> {
    const [row] = await db
      .select(journalSelect)
      .from(journalAudit)
      .leftJoin(utilisateurs, eq(journalAudit.utilisateurId, utilisateurs.id))
      .where(eq(journalAudit.id, id))
      .limit(1);

    return row ?? null;
  }

  async findAllForExport(filters: JournalAuditFilters): Promise<JournalAuditRow[]> {
    const where = buildWhereClause(filters);

    const query = db
      .select(journalSelect)
      .from(journalAudit)
      .leftJoin(utilisateurs, eq(journalAudit.utilisateurId, utilisateurs.id))
      .orderBy(desc(journalAudit.createdAt))
      .limit(10000);

    return where ? query.where(where) : query;
  }
}

export const journalAuditRepository = new JournalAuditRepository();
