import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { idParamSchema } from '../../shared/validation/common.validation.js';
import { affectationsController } from './affectations.controller.js';
import {
  createAffectationSchema,
  listAffectationsQuerySchema,
  materielIdParamSchema,
  terminerAffectationSchema,
  transferAffectationSchema,
  updateAffectationSchema,
  utilisateurIdParamSchema,
} from './affectations.validation.js';

const READ_ROLES = [
  RoleCode.ADMIN,
  RoleCode.CHEF_SERVICE,
  RoleCode.TECHNICIEN,
  RoleCode.UTILISATEUR,
] as const;

const WRITE_ROLES = [RoleCode.ADMIN, RoleCode.CHEF_SERVICE, RoleCode.TECHNICIEN] as const;

const affectationsRoutes = Router();

affectationsRoutes.use(authenticate);

affectationsRoutes.get(
  '/',
  authorize(...READ_ROLES),
  validate(listAffectationsQuerySchema as ZodSchema, 'query'),
  affectationsController.list,
);

affectationsRoutes.get(
  '/materiel/:materielId/historique',
  authorize(...READ_ROLES),
  validate(materielIdParamSchema, 'params'),
  affectationsController.getHistoriqueByMateriel,
);

affectationsRoutes.get(
  '/materiel/:materielId/active',
  authorize(...READ_ROLES),
  validate(materielIdParamSchema, 'params'),
  affectationsController.getActiveByMateriel,
);

affectationsRoutes.get(
  '/utilisateur/:utilisateurId',
  authorize(...READ_ROLES),
  validate(utilisateurIdParamSchema, 'params'),
  affectationsController.getByUtilisateur,
);

affectationsRoutes.get(
  '/:id',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  affectationsController.getById,
);

affectationsRoutes.post(
  '/',
  authorize(...WRITE_ROLES),
  validate(createAffectationSchema),
  affectationsController.create,
);

affectationsRoutes.put(
  '/:id',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  validate(updateAffectationSchema),
  affectationsController.update,
);

affectationsRoutes.post(
  '/:id/transfert',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  validate(transferAffectationSchema),
  affectationsController.transfer,
);

affectationsRoutes.patch(
  '/:id/terminer',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  validate(terminerAffectationSchema),
  affectationsController.terminer,
);

export default affectationsRoutes;
