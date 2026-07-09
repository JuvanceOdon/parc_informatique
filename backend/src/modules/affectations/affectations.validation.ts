import { z } from 'zod';
import { paginationSchema } from '../../shared/validation/common.validation.js';
import { AffectationStatut } from '../../shared/constants/affectation.constants.js';

export const createAffectationSchema = z.object({
  materielId: z.coerce.number().int().positive(),
  utilisateurId: z.coerce.number().int().positive(),
  serviceId: z.coerce.number().int().positive().nullable().optional(),
  localisation: z.string().max(255).nullable().optional(),
  motif: z.string().max(1000).nullable().optional(),
});

export const transferAffectationSchema = z.object({
  nouvelUtilisateurId: z.coerce.number().int().positive(),
  serviceId: z.coerce.number().int().positive().nullable().optional(),
  localisation: z.string().max(255).nullable().optional(),
  motif: z.string().max(1000).nullable().optional(),
});

export const terminerAffectationSchema = z.object({
  motif: z.string().max(1000).nullable().optional(),
});

export const updateAffectationSchema = z
  .object({
    serviceId: z.coerce.number().int().positive().nullable().optional(),
    localisation: z.string().max(255).nullable().optional(),
    motif: z.string().max(1000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

export const listAffectationsQuerySchema = paginationSchema.extend({
  materielId: z.coerce.number().int().positive().optional(),
  utilisateurId: z.coerce.number().int().positive().optional(),
  serviceId: z.coerce.number().int().positive().optional(),
  statut: z.nativeEnum(AffectationStatut).optional(),
  activeOnly: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['dateDebut', 'dateFin', 'createdAt']).default('dateDebut'),
});

export const materielIdParamSchema = z.object({
  materielId: z.coerce.number().int().positive(),
});

export const utilisateurIdParamSchema = z.object({
  utilisateurId: z.coerce.number().int().positive(),
});

export type CreateAffectationSchemaInput = z.infer<typeof createAffectationSchema>;
export type TransferAffectationSchemaInput = z.infer<typeof transferAffectationSchema>;
export type ListAffectationsQueryInput = z.infer<typeof listAffectationsQuerySchema>;
