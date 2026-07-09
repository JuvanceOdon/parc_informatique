import type { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../utils/index.js';
import { healthService } from './health.service.js';

export class HealthController {
  check = asyncHandler(async (_req: Request, res: Response) => {
    const health = await healthService.getHealthStatus();
    const statusCode = health.status === 'ok' ? 200 : 503;
    sendSuccess(res, health, 'État du système', statusCode);
  });
}

export const healthController = new HealthController();
