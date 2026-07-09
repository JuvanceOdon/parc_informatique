import { z } from 'zod';
import { RapportFormat } from './rapports.types.js';

const currentYear = new Date().getFullYear();

export const rapportMensuelQuerySchema = z.object({
  annee: z.coerce.number().int().min(2020).max(currentYear + 1),
  mois: z.coerce.number().int().min(1).max(12),
  format: z.nativeEnum(RapportFormat).default(RapportFormat.PDF),
  impression: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const rapportAnnuelQuerySchema = z.object({
  annee: z.coerce.number().int().min(2020).max(currentYear + 1),
  format: z.nativeEnum(RapportFormat).default(RapportFormat.PDF),
  impression: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export type RapportMensuelQueryInput = z.infer<typeof rapportMensuelQuerySchema>;
export type RapportAnnuelQueryInput = z.infer<typeof rapportAnnuelQuerySchema>;
