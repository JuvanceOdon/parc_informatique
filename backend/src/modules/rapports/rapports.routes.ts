import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { rapportsController } from './rapports.controller.js';
import {
  rapportAnnuelQuerySchema,
  rapportMensuelQuerySchema,
} from './rapports.validation.js';

const REPORT_ROLES = [RoleCode.ADMIN, RoleCode.CHEF_SERVICE, RoleCode.TECHNICIEN] as const;

const rapportsRoutes = Router();

rapportsRoutes.use(authenticate);

rapportsRoutes.get(
  '/mensuel',
  authorize(...REPORT_ROLES),
  validate(rapportMensuelQuerySchema as ZodSchema, 'query'),
  rapportsController.genererMensuel,
);

rapportsRoutes.get(
  '/annuel',
  authorize(...REPORT_ROLES),
  validate(rapportAnnuelQuerySchema as ZodSchema, 'query'),
  rapportsController.genererAnnuel,
);

export default rapportsRoutes;
