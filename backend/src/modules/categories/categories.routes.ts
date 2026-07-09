import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { idParamSchema } from '../../shared/validation/common.validation.js';
import { categoriesController } from './categories.controller.js';
import {
  createCategorieSchema,
  listCategoriesQuerySchema,
  updateCategorieSchema,
} from './categories.validation.js';

const READ_ROLES = [
  RoleCode.ADMIN,
  RoleCode.CHEF_SERVICE,
  RoleCode.TECHNICIEN,
  RoleCode.UTILISATEUR,
] as const;

const categoriesRoutes = Router();

categoriesRoutes.use(authenticate);

categoriesRoutes.get(
  '/',
  authorize(...READ_ROLES),
  validate(listCategoriesQuerySchema as ZodSchema, 'query'),
  categoriesController.list,
);

categoriesRoutes.get(
  '/:id',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  categoriesController.getById,
);

categoriesRoutes.post(
  '/',
  authorize(RoleCode.ADMIN),
  validate(createCategorieSchema),
  categoriesController.create,
);

categoriesRoutes.put(
  '/:id',
  authorize(RoleCode.ADMIN),
  validate(idParamSchema, 'params'),
  validate(updateCategorieSchema),
  categoriesController.update,
);

categoriesRoutes.delete(
  '/:id',
  authorize(RoleCode.ADMIN),
  validate(idParamSchema, 'params'),
  categoriesController.delete,
);

export default categoriesRoutes;
