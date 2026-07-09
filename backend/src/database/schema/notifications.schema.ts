import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { utilisateurs } from './utilisateurs.schema.js';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  utilisateurId: integer('utilisateur_id')
    .notNull()
    .references(() => utilisateurs.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 30 }).notNull(),
  titre: varchar('titre', { length: 255 }).notNull(),
  message: text('message').notNull(),
  entiteType: varchar('entite_type', { length: 30 }),
  entiteId: integer('entite_id'),
  lu: boolean('lu').notNull().default(false),
  luAt: timestamp('lu_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
