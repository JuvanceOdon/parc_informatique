import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { dashboardController } from './dashboard.controller.js';
import { dashboardQuerySchema } from './dashboard.validation.js';

const READ_ROLES = [
  RoleCode.ADMIN,
  RoleCode.CHEF_SERVICE,
  RoleCode.TECHNICIEN,
  RoleCode.UTILISATEUR,
] as const;

const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get(
  '/',
  authorize(...READ_ROLES),
  validate(dashboardQuerySchema as ZodSchema, 'query'),
  dashboardController.getDashboard,
);

dashboardRoutes.get(
  '/kpi',
  authorize(...READ_ROLES),
  dashboardController.getKpi,
);

export default dashboardRoutes;
