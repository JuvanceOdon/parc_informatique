import { pgTable, serial, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { maintenances } from './maintenances.schema.js';
import { utilisateurs } from './utilisateurs.schema.js';

export const maintenanceHistorique = pgTable('maintenance_historique', {
  id: serial('id').primaryKey(),
  maintenanceId: integer('maintenance_id')
    .notNull()
    .references(() => maintenances.id, { onDelete: 'cascade' }),
  utilisateurId: integer('utilisateur_id').references(() => utilisateurs.id),
  action: varchar('action', { length: 50 }).notNull(),
  description: text('description'),
  ancienneValeur: jsonb('ancienne_valeur'),
  nouvelleValeur: jsonb('nouvelle_valeur'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type MaintenanceHistoriqueEntry = typeof maintenanceHistorique.$inferSelect;
export type NewMaintenanceHistoriqueEntry = typeof maintenanceHistorique.$inferInsert;
