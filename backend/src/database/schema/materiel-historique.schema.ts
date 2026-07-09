import { pgTable, serial, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { materiels } from './materiels.schema.js';
import { utilisateurs } from './utilisateurs.schema.js';

export const materielHistorique = pgTable('materiel_historique', {
  id: serial('id').primaryKey(),
  materielId: integer('materiel_id')
    .notNull()
    .references(() => materiels.id, { onDelete: 'cascade' }),
  utilisateurId: integer('utilisateur_id').references(() => utilisateurs.id),
  action: varchar('action', { length: 50 }).notNull(),
  description: text('description'),
  ancienneValeur: jsonb('ancienne_valeur'),
  nouvelleValeur: jsonb('nouvelle_valeur'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type MaterielHistoriqueEntry = typeof materielHistorique.$inferSelect;
export type NewMaterielHistoriqueEntry = typeof materielHistorique.$inferInsert;
