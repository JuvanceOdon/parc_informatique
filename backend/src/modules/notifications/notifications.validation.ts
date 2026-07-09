import { z } from 'zod';
import { paginationSchema } from '../../shared/validation/common.validation.js';
import { NotificationType } from '../../shared/constants/notification.constants.js';

export const listNotificationsQuerySchema = paginationSchema.extend({
  type: z.nativeEnum(NotificationType).optional(),
  lu: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sortBy: z.enum(['createdAt', 'lu']).default('createdAt'),
});

export const createAlerteSchema = z.object({
  utilisateurIds: z.array(z.coerce.number().int().positive()).min(1).max(100),
  titre: z.string().min(3).max(255),
  message: z.string().min(5).max(2000),
});

export type ListNotificationsQueryInput = z.infer<typeof listNotificationsQuerySchema>;
export type CreateAlerteSchemaInput = z.infer<typeof createAlerteSchema>;
