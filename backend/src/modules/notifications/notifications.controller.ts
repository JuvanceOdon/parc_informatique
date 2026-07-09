import type { Request, Response } from 'express';
import {
  asyncHandler,
  sendCreated,
  sendSuccess,
  buildPaginationMeta,
} from '../../utils/index.js';
import { AppError } from '../../shared/errors/index.js';
import { notificationsService } from './notifications.service.js';
import type { ListNotificationsQueryInput } from './notifications.validation.js';

export class NotificationsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const query = req.query as unknown as ListNotificationsQueryInput;

    const { data, total } = await notificationsService.list(
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      { type: query.type, lu: query.lu },
      req.user.id,
    );

    sendSuccess(
      res,
      data,
      'Liste des notifications',
      200,
      buildPaginationMeta(query.page, query.limit, total),
    );
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const count = await notificationsService.getUnreadCount(req.user.id);
    sendSuccess(res, { count }, 'Nombre de notifications non lues');
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const notification = await notificationsService.markAsRead(id, req.user.id);
    sendSuccess(res, notification, 'Notification marquée comme lue');
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const count = await notificationsService.markAllAsRead(req.user.id);
    sendSuccess(res, { count }, 'Toutes les notifications ont été marquées comme lues');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    await notificationsService.delete(id, req.user.id);
    sendSuccess(res, null, 'Notification supprimée');
  });

  createAlerte = asyncHandler(async (req: Request, res: Response) => {
    const count = await notificationsService.createAlerte(req.body);
    sendCreated(res, { count }, `${count} alerte(s) envoyée(s)`);
  });
}

export const notificationsController = new NotificationsController();
