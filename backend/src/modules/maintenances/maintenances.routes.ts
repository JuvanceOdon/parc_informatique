import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { idParamSchema } from '../../shared/validation/common.validation.js';
import { maintenancesController } from './maintenances.controller.js';
import {
  annulerMaintenanceSchema,
  createMaintenanceSchema,
  diagnosticMaintenanceSchema,
  listMaintenancesQuerySchema,
  materielIdParamSchema,
  solutionMaintenanceSchema,
  updateMaintenanceSchema,
} from './maintenances.validation.js';

const READ_ROLES = [
  RoleCode.ADMIN,
  RoleCode.CHEF_SERVICE,
  RoleCode.TECHNICIEN,
  RoleCode.UTILISATEUR,
] as const;

const WRITE_ROLES = [RoleCode.ADMIN, RoleCode.CHEF_SERVICE, RoleCode.TECHNICIEN] as const;

const maintenancesRoutes = Router();

maintenancesRoutes.use(authenticate);

maintenancesRoutes.get(
  '/',
  authorize(...READ_ROLES),
  validate(listMaintenancesQuerySchema as ZodSchema, 'query'),
  maintenancesController.list,
);

maintenancesRoutes.get(
  '/materiel/:materielId/historique',
  authorize(...READ_ROLES),
  validate(materielIdParamSchema, 'params'),
  maintenancesController.getHistoriqueByMateriel,
);

maintenancesRoutes.get(
  '/materiel/:materielId/active',
  authorize(...READ_ROLES),
  validate(materielIdParamSchema, 'params'),
  maintenancesController.getActiveByMateriel,
);

maintenancesRoutes.get(
  '/:id',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  maintenancesController.getById,
);

maintenancesRoutes.get(
  '/:id/historique',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  maintenancesController.getHistorique,
);

maintenancesRoutes.post(
  '/',
  authorize(...WRITE_ROLES),
  validate(createMaintenanceSchema),
  maintenancesController.create,
);

maintenancesRoutes.put(
  '/:id',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  validate(updateMaintenanceSchema),
  maintenancesController.update,
);

maintenancesRoutes.delete(
  '/:id',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  maintenancesController.delete,
);

maintenancesRoutes.patch(
  '/:id/demarrer',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  maintenancesController.demarrer,
);

maintenancesRoutes.patch(
  '/:id/diagnostic',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  validate(diagnosticMaintenanceSchema),
  maintenancesController.enregistrerDiagnostic,
);

maintenancesRoutes.patch(
  '/:id/solution',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  validate(solutionMaintenanceSchema),
  maintenancesController.enregistrerSolution,
);

maintenancesRoutes.patch(
  '/:id/annuler',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  validate(annulerMaintenanceSchema),
  maintenancesController.annuler,
);

maintenancesRoutes.patch(
  '/:id/reprendre',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  maintenancesController.reprendre,
);

export default maintenancesRoutes;
