import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { idParamSchema } from '../../shared/validation/common.validation.js';
import { utilisateursController } from './utilisateurs.controller.js';
import {
  assignRoleSchema,
  createUtilisateurSchema,
  listUtilisateursQuerySchema,
  updateUtilisateurSchema,
} from './utilisateurs.validation.js';

const utilisateursRoutes = Router();

utilisateursRoutes.use(authenticate);
utilisateursRoutes.use(authorize(RoleCode.ADMIN));

utilisateursRoutes.get(
  '/',
  validate(listUtilisateursQuerySchema as ZodSchema, 'query'),
  utilisateursController.list,
);

utilisateursRoutes.get(
  '/:id',
  validate(idParamSchema, 'params'),
  utilisateursController.getById,
);

utilisateursRoutes.post(
  '/',
  validate(createUtilisateurSchema),
  utilisateursController.create,
);

utilisateursRoutes.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateUtilisateurSchema),
  utilisateursController.update,
);

utilisateursRoutes.patch(
  '/:id/desactiver',
  validate(idParamSchema, 'params'),
  utilisateursController.deactivate,
);

utilisateursRoutes.patch(
  '/:id/activer',
  validate(idParamSchema, 'params'),
  utilisateursController.activate,
);

utilisateursRoutes.patch(
  '/:id/role',
  validate(idParamSchema, 'params'),
  validate(assignRoleSchema),
  utilisateursController.assignRole,
);

export default utilisateursRoutes;
