import { relations } from 'drizzle-orm';
import { roles } from './roles.schema.js';
import { utilisateurs } from './utilisateurs.schema.js';
import { refreshTokens } from './refresh-tokens.schema.js';
import { services } from './services.schema.js';
import { categories } from './categories.schema.js';
import { materiels } from './materiels.schema.js';
import { materielImages } from './materiel-images.schema.js';
import { materielHistorique } from './materiel-historique.schema.js';
import { affectations } from './affectations.schema.js';
import { tickets } from './tickets.schema.js';
import { ticketCommentaires } from './ticket-commentaires.schema.js';
import { ticketPiecesJointes } from './ticket-pieces-jointes.schema.js';
import { ticketHistorique } from './ticket-historique.schema.js';
import { maintenances } from './maintenances.schema.js';
import { maintenanceHistorique } from './maintenance-historique.schema.js';
import { notifications } from './notifications.schema.js';
import { journalAudit } from './journal-audit.schema.js';

export const rolesRelations = relations(roles, ({ many }) => ({
  utilisateurs: many(utilisateurs),
}));

export const utilisateursRelations = relations(utilisateurs, ({ one, many }) => ({
  role: one(roles, {
    fields: [utilisateurs.roleId],
    references: [roles.id],
  }),
  service: one(services, {
    fields: [utilisateurs.serviceId],
    references: [services.id],
  }),
  refreshTokens: many(refreshTokens),
  notifications: many(notifications),
  journalAudit: many(journalAudit),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  utilisateur: one(utilisateurs, {
    fields: [refreshTokens.utilisateurId],
    references: [utilisateurs.id],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  responsable: one(utilisateurs, {
    fields: [services.responsableId],
    references: [utilisateurs.id],
  }),
  membres: many(utilisateurs),
  materiels: many(materiels),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  materiels: many(materiels),
}));

export const materielsRelations = relations(materiels, ({ one, many }) => ({
  categorie: one(categories, {
    fields: [materiels.categorieId],
    references: [categories.id],
  }),
  service: one(services, {
    fields: [materiels.serviceId],
    references: [services.id],
  }),
  images: many(materielImages),
  historique: many(materielHistorique),
  affectations: many(affectations),
  tickets: many(tickets),
  maintenances: many(maintenances),
}));

export const materielImagesRelations = relations(materielImages, ({ one }) => ({
  materiel: one(materiels, {
    fields: [materielImages.materielId],
    references: [materiels.id],
  }),
}));

export const materielHistoriqueRelations = relations(materielHistorique, ({ one }) => ({
  materiel: one(materiels, {
    fields: [materielHistorique.materielId],
    references: [materiels.id],
  }),
  utilisateur: one(utilisateurs, {
    fields: [materielHistorique.utilisateurId],
    references: [utilisateurs.id],
  }),
}));

export const affectationsRelations = relations(affectations, ({ one }) => ({
  materiel: one(materiels, {
    fields: [affectations.materielId],
    references: [materiels.id],
  }),
  utilisateur: one(utilisateurs, {
    fields: [affectations.utilisateurId],
    references: [utilisateurs.id],
  }),
  service: one(services, {
    fields: [affectations.serviceId],
    references: [services.id],
  }),
  affectePar: one(utilisateurs, {
    fields: [affectations.affecteParId],
    references: [utilisateurs.id],
    relationName: 'affectePar',
  }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  materiel: one(materiels, {
    fields: [tickets.materielId],
    references: [materiels.id],
  }),
  demandeur: one(utilisateurs, {
    fields: [tickets.demandeurId],
    references: [utilisateurs.id],
    relationName: 'demandeur',
  }),
  assignee: one(utilisateurs, {
    fields: [tickets.assigneeId],
    references: [utilisateurs.id],
    relationName: 'assignee',
  }),
  service: one(services, {
    fields: [tickets.serviceId],
    references: [services.id],
  }),
  commentaires: many(ticketCommentaires),
  piecesJointes: many(ticketPiecesJointes),
  historique: many(ticketHistorique),
}));

export const ticketCommentairesRelations = relations(ticketCommentaires, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketCommentaires.ticketId],
    references: [tickets.id],
  }),
  utilisateur: one(utilisateurs, {
    fields: [ticketCommentaires.utilisateurId],
    references: [utilisateurs.id],
  }),
}));

export const ticketPiecesJointesRelations = relations(ticketPiecesJointes, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketPiecesJointes.ticketId],
    references: [tickets.id],
  }),
  uploadedBy: one(utilisateurs, {
    fields: [ticketPiecesJointes.uploadedById],
    references: [utilisateurs.id],
  }),
}));

export const ticketHistoriqueRelations = relations(ticketHistorique, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketHistorique.ticketId],
    references: [tickets.id],
  }),
  utilisateur: one(utilisateurs, {
    fields: [ticketHistorique.utilisateurId],
    references: [utilisateurs.id],
  }),
}));

export const maintenancesRelations = relations(maintenances, ({ one, many }) => ({
  materiel: one(materiels, {
    fields: [maintenances.materielId],
    references: [materiels.id],
  }),
  ticket: one(tickets, {
    fields: [maintenances.ticketId],
    references: [tickets.id],
  }),
  technicien: one(utilisateurs, {
    fields: [maintenances.technicienId],
    references: [utilisateurs.id],
    relationName: 'technicien',
  }),
  createdBy: one(utilisateurs, {
    fields: [maintenances.createdById],
    references: [utilisateurs.id],
    relationName: 'createdBy',
  }),
  historique: many(maintenanceHistorique),
}));

export const maintenanceHistoriqueRelations = relations(maintenanceHistorique, ({ one }) => ({
  maintenance: one(maintenances, {
    fields: [maintenanceHistorique.maintenanceId],
    references: [maintenances.id],
  }),
  utilisateur: one(utilisateurs, {
    fields: [maintenanceHistorique.utilisateurId],
    references: [utilisateurs.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  utilisateur: one(utilisateurs, {
    fields: [notifications.utilisateurId],
    references: [utilisateurs.id],
  }),
}));

export const journalAuditRelations = relations(journalAudit, ({ one }) => ({
  utilisateur: one(utilisateurs, {
    fields: [journalAudit.utilisateurId],
    references: [utilisateurs.id],
  }),
}));
