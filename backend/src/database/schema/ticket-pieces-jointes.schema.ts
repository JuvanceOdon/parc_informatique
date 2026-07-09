import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { tickets } from './tickets.schema.js';
import { utilisateurs } from './utilisateurs.schema.js';

export const ticketPiecesJointes = pgTable('ticket_pieces_jointes', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  uploadedById: integer('uploaded_by_id')
    .notNull()
    .references(() => utilisateurs.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type TicketPieceJointe = typeof ticketPiecesJointes.$inferSelect;
export type NewTicketPieceJointe = typeof ticketPiecesJointes.$inferInsert;
