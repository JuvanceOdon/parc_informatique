import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  date,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { categories } from './categories.schema.js';
import { services } from './services.schema.js';

export const materiels = pgTable(
  'materiels',
  {
    id: serial('id').primaryKey(),
    codeMateriel: varchar('code_materiel', { length: 50 }).notNull(),
    numeroSerie: varchar('numero_serie', { length: 100 }),
    designation: varchar('designation', { length: 200 }).notNull(),
    marque: varchar('marque', { length: 100 }),
    modele: varchar('modele', { length: 100 }),
    categorieId: integer('categorie_id')
      .notNull()
      .references(() => categories.id),
    serviceId: integer('service_id').references(() => services.id),
    localisation: varchar('localisation', { length: 255 }),
    dateAcquisition: date('date_acquisition'),
    dateFinGarantie: date('date_fin_garantie'),
    statut: varchar('statut', { length: 30 }).notNull().default('EN_STOCK'),
    etat: varchar('etat', { length: 20 }).notNull().default('BON'),
    description: text('description'),
    actif: boolean('actif').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    codeMaterielUnique: uniqueIndex('materiels_code_materiel_unique').on(table.codeMateriel),
    numeroSerieUnique: uniqueIndex('materiels_numero_serie_unique').on(table.numeroSerie),
  }),
);

export type Materiel = typeof materiels.$inferSelect;
export type NewMateriel = typeof materiels.$inferInsert;
