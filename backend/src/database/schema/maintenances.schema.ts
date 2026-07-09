import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
} from 'drizzle-orm/pg-core';
import { materiels } from './materiels.schema.js';
import { tickets } from './tickets.schema.js';
import { utilisateurs } from './utilisateurs.schema.js';

export const maintenances = pgTable('maintenances', {
  id: serial('id').primaryKey(),
  numeroMaintenance: varchar('numero_maintenance', { length: 20 }).notNull().unique(),
  materielId: integer('materiel_id')
    .notNull()
    .references(() => materiels.id),
  ticketId: integer('ticket_id').references(() => tickets.id),
  type: varchar('type', { length: 20 }).notNull(),
  statut: varchar('statut', { length: 20 }).notNull().default('PLANIFIEE'),
  titre: varchar('titre', { length: 255 }).notNull(),
  description: text('description'),
  diagnostic: text('diagnostic'),
  solution: text('solution'),
  technicienId: integer('technicien_id').references(() => utilisateurs.id),
  statutMaterielAvant: varchar('statut_materiel_avant', { length: 30 }),
  etatMaterielAvant: varchar('etat_materiel_avant', { length: 20 }),
  statutMaterielApres: varchar('statut_materiel_apres', { length: 30 }),
  etatMaterielApres: varchar('etat_materiel_apres', { length: 20 }),
  datePlanifiee: timestamp('date_planifiee', { withTimezone: true }),
  dateDebut: timestamp('date_debut', { withTimezone: true }),
  dateFin: timestamp('date_fin', { withTimezone: true }),
  cout: numeric('cout', { precision: 12, scale: 2 }),
  createdById: integer('created_by_id')
    .notNull()
    .references(() => utilisateurs.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Maintenance = typeof maintenances.$inferSelect;
export type NewMaintenance = typeof maintenances.$inferInsert;
