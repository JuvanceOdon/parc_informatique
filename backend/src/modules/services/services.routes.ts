import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { idParamSchema } from '../../shared/validation/common.validation.js';
import { servicesController } from './services.controller.js';
import {
  assignResponsableSchema,
  createServiceSchema,
  listServicesQuerySchema,
  updateServiceSchema,
} from './services.validation.js';

const servicesRoutes = Router();

servicesRoutes.use(authenticate);

servicesRoutes.get(
  '/',
  authorize(RoleCode.ADMIN, RoleCode.CHEF_SERVICE),
  validate(listServicesQuerySchema as ZodSchema, 'query'),
  servicesController.list,
);

servicesRoutes.get(
  '/:id',
  authorize(RoleCode.ADMIN, RoleCode.CHEF_SERVICE),
  validate(idParamSchema, 'params'),
  servicesController.getById,
);

servicesRoutes.post(
  '/',
  authorize(RoleCode.ADMIN),
  validate(createServiceSchema),
  servicesController.create,
);

servicesRoutes.put(
  '/:id',
  authorize(RoleCode.ADMIN),
  validate(idParamSchema, 'params'),
  validate(updateServiceSchema),
  servicesController.update,
);

servicesRoutes.patch(
  '/:id/desactiver',
  authorize(RoleCode.ADMIN),
  validate(idParamSchema, 'params'),
  servicesController.deactivate,
);

servicesRoutes.patch(
  '/:id/activer',
  authorize(RoleCode.ADMIN),
  validate(idParamSchema, 'params'),
  servicesController.activate,
);

servicesRoutes.patch(
  '/:id/responsable',
  authorize(RoleCode.ADMIN),
  validate(idParamSchema, 'params'),
  validate(assignResponsableSchema),
  servicesController.assignResponsable,
);

servicesRoutes.delete(
  '/:id/responsable',
  authorize(RoleCode.ADMIN),
  validate(idParamSchema, 'params'),
  servicesController.removeResponsable,
);

export default servicesRoutes;
