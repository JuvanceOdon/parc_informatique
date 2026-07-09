import type { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../utils/index.js';
import { dashboardService } from './dashboard.service.js';
import type { DashboardQueryInput } from './dashboard.validation.js';

export class DashboardController {
  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as DashboardQueryInput;
    const dashboard = await dashboardService.getDashboard({ months: query.months });
    sendSuccess(res, dashboard, 'Tableau de bord');
  });

  getKpi = asyncHandler(async (_req: Request, res: Response) => {
    const kpi = await dashboardService.getKpi();
    sendSuccess(res, kpi, 'Indicateurs KPI');
  });
}

export const dashboardController = new DashboardController();
