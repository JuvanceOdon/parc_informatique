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

export const affectations = pgTable('affectations', {
  id: serial('id').primaryKey(),
  materielId: integer('materiel_id')
    .notNull()
    .references(() => materiels.id),
  utilisateurId: integer('utilisateur_id')
    .notNull()
    .references(() => utilisateurs.id),
  serviceId: integer('service_id').references(() => services.id),
  localisation: varchar('localisation', { length: 255 }),
  dateDebut: timestamp('date_debut', { withTimezone: true }).notNull().defaultNow(),
  dateFin: timestamp('date_fin', { withTimezone: true }),
  statut: varchar('statut', { length: 20 }).notNull().default('ACTIVE'),
  motif: text('motif'),
  affecteParId: integer('affecte_par_id').references(() => utilisateurs.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Affectation = typeof affectations.$inferSelect;
export type NewAffectation = typeof affectations.$inferInsert;
