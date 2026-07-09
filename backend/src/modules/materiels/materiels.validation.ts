import { z } from 'zod';
import { paginationSchema } from '../../shared/validation/common.validation.js';
import {
  MATERIEL_ETATS,
  MATERIEL_STATUTS,
  MaterielEtat,
  MaterielStatut,
} from '../../shared/constants/materiel.constants.js';

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
  .nullable()
  .optional();

export const createMaterielSchema = z.object({
  numeroSerie: z.string().max(100).nullable().optional(),
  designation: z.string().min(2).max(200),
  marque: z.string().max(100).nullable().optional(),
  modele: z.string().max(100).nullable().optional(),
  categorieId: z.coerce.number().int().positive(),
  serviceId: z.coerce.number().int().positive().nullable().optional(),
  localisation: z.string().max(255).nullable().optional(),
  dateAcquisition: dateSchema,
  dateFinGarantie: dateSchema,
  statut: z.nativeEnum(MaterielStatut).optional(),
  etat: z.nativeEnum(MaterielEtat).optional(),
  description: z.string().max(2000).nullable().optional(),
});

export const updateMaterielSchema = z
  .object({
    numeroSerie: z.string().max(100).nullable().optional(),
    designation: z.string().min(2).max(200).optional(),
    marque: z.string().max(100).nullable().optional(),
    modele: z.string().max(100).nullable().optional(),
    categorieId: z.coerce.number().int().positive().optional(),
    serviceId: z.coerce.number().int().positive().nullable().optional(),
    localisation: z.string().max(255).nullable().optional(),
    dateAcquisition: dateSchema,
    dateFinGarantie: dateSchema,
    statut: z.nativeEnum(MaterielStatut).optional(),
    etat: z.nativeEnum(MaterielEtat).optional(),
    description: z.string().max(2000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

export const listMaterielsQuerySchema = paginationSchema.extend({
  search: z.string().max(255).optional(),
  categorieId: z.coerce.number().int().positive().optional(),
  serviceId: z.coerce.number().int().positive().optional(),
  statut: z.nativeEnum(MaterielStatut).optional(),
  etat: z.nativeEnum(MaterielEtat).optional(),
  actif: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  garantieExpiree: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  garantieExpireBientot: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sortBy: z
    .enum(['codeMateriel', 'designation', 'dateAcquisition', 'dateFinGarantie', 'createdAt'])
    .default('createdAt'),
});

export const codeParamSchema = z.object({
  code: z.string().min(1).max(50),
});

export type CreateMaterielSchemaInput = z.infer<typeof createMaterielSchema>;
export type UpdateMaterielSchemaInput = z.infer<typeof updateMaterielSchema>;
export type ListMaterielsQueryInput = z.infer<typeof listMaterielsQuerySchema>;

export { MATERIEL_STATUTS, MATERIEL_ETATS };
