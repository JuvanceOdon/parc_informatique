import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { materiels } from './materiels.schema.js';
import { utilisateurs } from './utilisateurs.schema.js';
import { services } from './services.schema.js';

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  numeroTicket: varchar('numero_ticket', { length: 20 }).notNull().unique(),
  titre: varchar('titre', { length: 255 }).notNull(),
  description: text('description').notNull(),
  materielId: integer('materiel_id').references(() => materiels.id),
  demandeurId: integer('demandeur_id')
    .notNull()
    .references(() => utilisateurs.id),
  assigneeId: integer('assignee_id').references(() => utilisateurs.id),
  serviceId: integer('service_id').references(() => services.id),
  priorite: varchar('priorite', { length: 20 }).notNull().default('MOYENNE'),
  statut: varchar('statut', { length: 20 }).notNull().default('OUVERT'),
  dateResolution: timestamp('date_resolution', { withTimezone: true }),
  dateFermeture: timestamp('date_fermeture', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
