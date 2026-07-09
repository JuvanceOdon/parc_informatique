import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ticketAttachmentUpload } from '../../middlewares/ticket-upload.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { idParamSchema } from '../../shared/validation/common.validation.js';
import { ticketsController } from './tickets.controller.js';
import {
  addTicketCommentaireSchema,
  assignTicketSchema,
  changeTicketPrioriteSchema,
  changeTicketStatutSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  pieceJointeParamSchema,
  updateTicketSchema,
} from './tickets.validation.js';

const READ_ROLES = [
  RoleCode.ADMIN,
  RoleCode.CHEF_SERVICE,
  RoleCode.TECHNICIEN,
  RoleCode.UTILISATEUR,
] as const;

const STAFF_ROLES = [RoleCode.ADMIN, RoleCode.CHEF_SERVICE, RoleCode.TECHNICIEN] as const;

const ticketsRoutes = Router();

ticketsRoutes.use(authenticate);

ticketsRoutes.get(
  '/',
  authorize(...READ_ROLES),
  validate(listTicketsQuerySchema as ZodSchema, 'query'),
  ticketsController.list,
);

ticketsRoutes.get(
  '/:id',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  ticketsController.getById,
);

ticketsRoutes.get(
  '/:id/commentaires',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  ticketsController.getCommentaires,
);

ticketsRoutes.get(
  '/:id/historique',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  ticketsController.getHistorique,
);

ticketsRoutes.post(
  '/',
  authorize(...READ_ROLES),
  validate(createTicketSchema),
  ticketsController.create,
);

ticketsRoutes.put(
  '/:id',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  validate(updateTicketSchema),
  ticketsController.update,
);

ticketsRoutes.patch(
  '/:id/statut',
  authorize(...STAFF_ROLES),
  validate(idParamSchema, 'params'),
  validate(changeTicketStatutSchema),
  ticketsController.changeStatut,
);

ticketsRoutes.patch(
  '/:id/priorite',
  authorize(...STAFF_ROLES),
  validate(idParamSchema, 'params'),
  validate(changeTicketPrioriteSchema),
  ticketsController.changePriorite,
);

ticketsRoutes.patch(
  '/:id/assigner',
  authorize(...STAFF_ROLES),
  validate(idParamSchema, 'params'),
  validate(assignTicketSchema),
  ticketsController.assign,
);

ticketsRoutes.post(
  '/:id/commentaires',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  validate(addTicketCommentaireSchema),
  ticketsController.addCommentaire,
);

ticketsRoutes.post(
  '/:id/pieces-jointes',
  authorize(...READ_ROLES),
  validate(idParamSchema, 'params'),
  ticketAttachmentUpload.single('fichier'),
  ticketsController.addPieceJointe,
);

ticketsRoutes.delete(
  '/:id/pieces-jointes/:pieceId',
  authorize(...READ_ROLES),
  validate(pieceJointeParamSchema, 'params'),
  ticketsController.deletePieceJointe,
);

export default ticketsRoutes;
