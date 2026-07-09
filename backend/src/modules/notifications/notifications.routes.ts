import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { idParamSchema } from '../../shared/validation/common.validation.js';
import { notificationsController } from './notifications.controller.js';
import {
  createAlerteSchema,
  listNotificationsQuerySchema,
} from './notifications.validation.js';

const READ_ROLES = [
  RoleCode.ADMIN,
  RoleCode.CHEF_SERVICE,
  RoleCode.TECHNICIEN,
  RoleCode.UTILISATEUR,
] as const;

const ALERTE_ROLES = [RoleCode.ADMIN, RoleCode.CHEF_SERVICE] as const;

const notificationsRoutes = Router();

notificationsRoutes.use(authenticate);

notificationsRoutes.get(
  '/',
  authorize(...READ_ROLES),
  validate(listNotificationsQuerySchema as ZodSchema, 'query'),
  notificationsController.list,
);

notificationsRoutes.get(
  '/non-lues/count',
  authorize(...READ_ROLES),
  notificationsController.getUnreadCount,
);

notificationsRoutes.patch(
  '/lire-toutes',
  authorize(...READ_ROLES),
  notificationsController.markAllAsRead,
);

notificationsRoutes.post(
  '/alertes',
  authorize(...ALERTE_ROLES),
  validate(createAlerteSchema),
  notificationsController.createAlerte,
);

notificationsRoutes.patch(
  '/:id/lire',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  notificationsController.markAsRead,
);

notificationsRoutes.delete(
  '/:id',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  notificationsController.delete,
);

export default notificationsRoutes;
