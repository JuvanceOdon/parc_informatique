import { z } from 'zod';
import { paginationSchema } from '../../shared/validation/common.validation.js';

const codeSchema = z
  .string({ required_error: 'Le code est requis' })
  .min(2, 'Le code doit contenir au moins 2 caractères')
  .max(50, 'Le code ne doit pas dépasser 50 caractères')
  .regex(/^[A-Za-z0-9_-]+$/, 'Le code contient des caractères invalides');

const libelleSchema = z
  .string({ required_error: 'Le libellé est requis' })
  .min(2, 'Le libellé doit contenir au moins 2 caractères')
  .max(150, 'Le libellé ne doit pas dépasser 150 caractères');

export const createServiceSchema = z.object({
  code: codeSchema,
  libelle: libelleSchema,
  description: z.string().max(1000).nullable().optional(),
  responsableId: z.coerce.number().int().positive().nullable().optional(),
});

export const updateServiceSchema = z
  .object({
    code: codeSchema.optional(),
    libelle: libelleSchema.optional(),
    description: z.string().max(1000).nullable().optional(),
    responsableId: z.coerce.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

export const assignResponsableSchema = z.object({
  responsableId: z.coerce.number().int().positive('Le responsable est invalide'),
});

export const listServicesQuerySchema = paginationSchema.extend({
  search: z.string().max(255).optional(),
  actif: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sortBy: z.enum(['code', 'libelle', 'createdAt']).default('createdAt'),
});

export type CreateServiceSchemaInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceSchemaInput = z.infer<typeof updateServiceSchema>;
export type AssignResponsableSchemaInput = z.infer<typeof assignResponsableSchema>;
export type ListServicesQueryInput = z.infer<typeof listServicesQuerySchema>;
