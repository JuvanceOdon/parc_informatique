import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { utilisateurs } from './utilisateurs.schema.js';

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  utilisateurId: integer('utilisateur_id')
    .notNull()
    .references(() => utilisateurs.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
