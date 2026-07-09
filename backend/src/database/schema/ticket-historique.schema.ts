import { pgTable, serial, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { tickets } from './tickets.schema.js';
import { utilisateurs } from './utilisateurs.schema.js';

export const ticketHistorique = pgTable('ticket_historique', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  utilisateurId: integer('utilisateur_id').references(() => utilisateurs.id),
  action: varchar('action', { length: 50 }).notNull(),
  description: text('description'),
  ancienneValeur: jsonb('ancienne_valeur'),
  nouvelleValeur: jsonb('nouvelle_valeur'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type TicketHistoriqueEntry = typeof ticketHistorique.$inferSelect;
export type NewTicketHistoriqueEntry = typeof ticketHistorique.$inferInsert;
