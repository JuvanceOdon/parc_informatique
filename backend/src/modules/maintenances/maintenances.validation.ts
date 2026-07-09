import { z } from 'zod';
import { paginationSchema } from '../../shared/validation/common.validation.js';
import {
  MaintenanceStatut,
  MaintenanceType,
} from '../../shared/constants/maintenance.constants.js';
import { MaterielEtat, MaterielStatut } from '../../shared/constants/materiel.constants.js';

export const createMaintenanceSchema = z.object({
  materielId: z.coerce.number().int().positive(),
  ticketId: z.coerce.number().int().positive().nullable().optional(),
  type: z.nativeEnum(MaintenanceType),
  titre: z.string().min(3).max(255),
  description: z.string().max(5000).nullable().optional(),
  technicienId: z.coerce.number().int().positive().nullable().optional(),
  datePlanifiee: z.string().datetime({ offset: true }).nullable().optional(),
  cout: z.coerce.number().nonnegative().nullable().optional(),
  demarrer: z.boolean().default(false),
});

export const updateMaintenanceSchema = z.object({
  titre: z.string().min(3).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  technicienId: z.coerce.number().int().positive().nullable().optional(),
  datePlanifiee: z.string().datetime({ offset: true }).nullable().optional(),
  cout: z.coerce.number().nonnegative().nullable().optional(),
  diagnostic: z.string().min(10).max(5000).nullable().optional(),
});

export const diagnosticMaintenanceSchema = z.object({
  diagnostic: z.string().min(10).max(5000),
});

export const solutionMaintenanceSchema = z.object({
  solution: z.string().min(10).max(5000),
  etatMaterielApres: z.nativeEnum(MaterielEtat).optional(),
  statutMaterielApres: z.nativeEnum(MaterielStatut).optional(),
  cout: z.coerce.number().nonnegative().nullable().optional(),
});

export const annulerMaintenanceSchema = z.object({
  motif: z.string().max(1000).nullable().optional(),
});

export const listMaintenancesQuerySchema = paginationSchema.extend({
  materielId: z.coerce.number().int().positive().optional(),
  ticketId: z.coerce.number().int().positive().optional(),
  technicienId: z.coerce.number().int().positive().optional(),
  type: z.nativeEnum(MaintenanceType).optional(),
  statut: z.nativeEnum(MaintenanceStatut).optional(),
  activeOnly: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().max(255).optional(),
  sortBy: z
    .enum(['createdAt', 'dateDebut', 'dateFin', 'datePlanifiee', 'numeroMaintenance'])
    .default('createdAt'),
});

export const materielIdParamSchema = z.object({
  materielId: z.coerce.number().int().positive(),
});

export type CreateMaintenanceSchemaInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceSchemaInput = z.infer<typeof updateMaintenanceSchema>;
export type ListMaintenancesQueryInput = z.infer<typeof listMaintenancesQuerySchema>;
