import { z } from 'zod';
import { paginationSchema } from '../../shared/validation/common.validation.js';
import { TicketPriorite, TicketStatut } from '../../shared/constants/ticket.constants.js';

export const createTicketSchema = z.object({
  titre: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  materielId: z.coerce.number().int().positive().nullable().optional(),
  serviceId: z.coerce.number().int().positive().nullable().optional(),
  priorite: z.nativeEnum(TicketPriorite).default(TicketPriorite.MOYENNE),
});

export const updateTicketSchema = z.object({
  titre: z.string().min(3).max(255).optional(),
  description: z.string().min(10).max(5000).optional(),
  materielId: z.coerce.number().int().positive().nullable().optional(),
  serviceId: z.coerce.number().int().positive().nullable().optional(),
});

export const changeTicketStatutSchema = z.object({
  statut: z.nativeEnum(TicketStatut),
  commentaire: z.string().max(1000).nullable().optional(),
});

export const changeTicketPrioriteSchema = z.object({
  priorite: z.nativeEnum(TicketPriorite),
});

export const assignTicketSchema = z.object({
  assigneeId: z.coerce.number().int().positive().nullable(),
});

export const addTicketCommentaireSchema = z.object({
  contenu: z.string().min(1).max(5000),
});

export const listTicketsQuerySchema = paginationSchema.extend({
  statut: z.nativeEnum(TicketStatut).optional(),
  priorite: z.nativeEnum(TicketPriorite).optional(),
  demandeurId: z.coerce.number().int().positive().optional(),
  assigneeId: z.coerce.number().int().positive().optional(),
  materielId: z.coerce.number().int().positive().optional(),
  serviceId: z.coerce.number().int().positive().optional(),
  search: z.string().max(255).optional(),
  mesTicketsOnly: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priorite', 'statut', 'numeroTicket']).default('createdAt'),
});

export const pieceJointeParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  pieceId: z.coerce.number().int().positive(),
});

export type CreateTicketSchemaInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketSchemaInput = z.infer<typeof updateTicketSchema>;
export type ChangeTicketStatutSchemaInput = z.infer<typeof changeTicketStatutSchema>;
export type AssignTicketSchemaInput = z.infer<typeof assignTicketSchema>;
export type ListTicketsQueryInput = z.infer<typeof listTicketsQuerySchema>;
