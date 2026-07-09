import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { tickets } from './tickets.schema.js';
import { utilisateurs } from './utilisateurs.schema.js';

export const ticketCommentaires = pgTable('ticket_commentaires', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  utilisateurId: integer('utilisateur_id')
    .notNull()
    .references(() => utilisateurs.id),
  contenu: text('contenu').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type TicketCommentaire = typeof ticketCommentaires.$inferSelect;
export type NewTicketCommentaire = typeof ticketCommentaires.$inferInsert;
