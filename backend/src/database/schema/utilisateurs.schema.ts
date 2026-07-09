import { pgTable, serial, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { roles } from './roles.schema.js';
import { services } from './services.schema.js';

export const utilisateurs = pgTable('utilisateurs', {
  id: serial('id').primaryKey(),
  matricule: varchar('matricule', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  motDePasse: varchar('mot_de_passe', { length: 255 }).notNull(),
  nom: varchar('nom', { length: 100 }).notNull(),
  prenom: varchar('prenom', { length: 100 }).notNull(),
  telephone: varchar('telephone', { length: 20 }),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id),
  serviceId: integer('service_id').references(() => services.id),
  actif: boolean('actif').notNull().default(true),
  derniereConnexion: timestamp('derniere_connexion', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Utilisateur = typeof utilisateurs.$inferSelect;
export type NewUtilisateur = typeof utilisateurs.$inferInsert;
