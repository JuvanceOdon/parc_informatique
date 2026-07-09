import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  months: z.coerce.number().int().min(3).max(24).default(12),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
