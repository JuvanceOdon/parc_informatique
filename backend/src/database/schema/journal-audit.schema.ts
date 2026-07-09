import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { utilisateurs } from './utilisateurs.schema.js';

export const journalAudit = pgTable('journal_audit', {
  id: serial('id').primaryKey(),
  utilisateurId: integer('utilisateur_id').references(() => utilisateurs.id, {
    onDelete: 'set null',
  }),
  action: varchar('action', { length: 30 }).notNull(),
  categorie: varchar('categorie', { length: 30 }).notNull(),
  description: text('description').notNull(),
  entiteType: varchar('entite_type', { length: 50 }),
  entiteId: integer('entite_id'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  metadonnees: jsonb('metadonnees'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type JournalAuditEntry = typeof journalAudit.$inferSelect;
export type NewJournalAuditEntry = typeof journalAudit.$inferInsert;
