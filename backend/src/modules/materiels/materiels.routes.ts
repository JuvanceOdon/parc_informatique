import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { materielImageUpload } from '../../middlewares/materiel-upload.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { idParamSchema } from '../../shared/validation/common.validation.js';
import { materielsController } from './materiels.controller.js';
import {
  codeParamSchema,
  createMaterielSchema,
  listMaterielsQuerySchema,
  updateMaterielSchema,
} from './materiels.validation.js';

const READ_ROLES = [
  RoleCode.ADMIN,
  RoleCode.CHEF_SERVICE,
  RoleCode.TECHNICIEN,
  RoleCode.UTILISATEUR,
] as const;

const WRITE_ROLES = [RoleCode.ADMIN, RoleCode.CHEF_SERVICE, RoleCode.TECHNICIEN] as const;

const materielsRoutes = Router();

materielsRoutes.use(authenticate);

materielsRoutes.get(
  '/',
  authorize(...READ_ROLES),
  validate(listMaterielsQuerySchema as ZodSchema, 'query'),
  materielsController.list,
);

materielsRoutes.get(
  '/code/:code',
  authorize(...READ_ROLES),
  validate(codeParamSchema, 'params'),
  materielsController.getByCode,
);

materielsRoutes.get(
  '/:id',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  materielsController.getById,
);

materielsRoutes.get(
  '/:id/historique',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  materielsController.getHistorique,
);

materielsRoutes.get(
  '/:id/qrcode',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  materielsController.getQrCode,
);

materielsRoutes.post(
  '/',
  authorize(...WRITE_ROLES),
  validate(createMaterielSchema),
  materielsController.create,
);

materielsRoutes.put(
  '/:id',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  validate(updateMaterielSchema),
  materielsController.update,
);

materielsRoutes.patch(
  '/:id/desactiver',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  materielsController.deactivate,
);

materielsRoutes.post(
  '/:id/images',
  authorize(...WRITE_ROLES),
  validate(idParamSchema, 'params'),
  materielImageUpload.single('image'),
  materielsController.uploadImage,
);

materielsRoutes.delete(
  '/:id/images/:imageId',
  authorize(...WRITE_ROLES),
  materielsController.deleteImage,
);

export default materielsRoutes;
