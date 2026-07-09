import { pgTable, serial, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { materiels } from './materiels.schema.js';

export const materielImages = pgTable('materiel_images', {
  id: serial('id').primaryKey(),
  materielId: integer('materiel_id')
    .notNull()
    .references(() => materiels.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 50 }).notNull(),
  size: integer('size').notNull(),
  isPrincipal: boolean('is_principal').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type MaterielImage = typeof materielImages.$inferSelect;
export type NewMaterielImage = typeof materielImages.$inferInsert;
