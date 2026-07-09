import { z } from 'zod';
import { paginationSchema } from '../../shared/validation/common.validation.js';
import {
  AuditAction,
  AuditCategorie,
  AuditExportFormat,
} from '../../shared/constants/audit.constants.js';

export const listJournalAuditQuerySchema = paginationSchema.extend({
  action: z.nativeEnum(AuditAction).optional(),
  categorie: z.nativeEnum(AuditCategorie).optional(),
  utilisateurId: z.coerce.number().int().positive().optional(),
  dateDebut: z.string().datetime({ offset: true }).optional(),
  dateFin: z.string().datetime({ offset: true }).optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['createdAt', 'action', 'categorie']).default('createdAt'),
});

export const exportJournalAuditQuerySchema = listJournalAuditQuerySchema
  .omit({ page: true, limit: true, sortBy: true, sortOrder: true })
  .extend({
    format: z.nativeEnum(AuditExportFormat).default(AuditExportFormat.CSV),
  });

export type ListJournalAuditQueryInput = z.infer<typeof listJournalAuditQuerySchema>;
export type ExportJournalAuditQueryInput = z.infer<typeof exportJournalAuditQuerySchema>;
