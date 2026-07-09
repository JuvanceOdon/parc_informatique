import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { idParamSchema } from '../../shared/validation/common.validation.js';
import { journalAuditController } from './journal-audit.controller.js';
import {
  exportJournalAuditQuerySchema,
  listJournalAuditQuerySchema,
} from './journal-audit.validation.js';

const ADMIN_ROLES = [RoleCode.ADMIN, RoleCode.CHEF_SERVICE] as const;

const journalAuditRoutes = Router();

journalAuditRoutes.use(authenticate);
journalAuditRoutes.use(authorize(...ADMIN_ROLES));

journalAuditRoutes.get(
  '/export',
  validate(exportJournalAuditQuerySchema as ZodSchema, 'query'),
  journalAuditController.export,
);

journalAuditRoutes.get(
  '/',
  validate(listJournalAuditQuerySchema as ZodSchema, 'query'),
  journalAuditController.list,
);

journalAuditRoutes.get(
  '/:id',
  validate(idParamSchema, 'params'),
  journalAuditController.getById,
);

export default journalAuditRoutes;
