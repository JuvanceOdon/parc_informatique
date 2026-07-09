import { AppError } from '../../shared/errors/index.js';
import {
  NotificationEntiteType,
  NotificationType,
} from '../../shared/constants/notification.constants.js';
import type { INotificationsRepository } from './notifications.interfaces.js';
import type {
  CreateAlerteInput,
  CreateNotificationInput,
  NotificationFilters,
  NotificationListQuery,
  NotificationResponse,
  NotificationRow,
} from './notifications.types.js';
import { notificationsRepository } from './notifications.repository.js';

export class NotificationsService {
  constructor(
    private readonly repository: INotificationsRepository = notificationsRepository,
  ) {}

  async list(
    query: NotificationListQuery,
    filters: Omit<NotificationFilters, 'utilisateurId'>,
    utilisateurId: number,
  ): Promise<{ data: NotificationResponse[]; total: number }> {
    const { rows, total } = await this.repository.findAll(query, {
      ...filters,
      utilisateurId,
    });

    return { data: rows.map((row) => this.mapToResponse(row)), total };
  }

  async getUnreadCount(utilisateurId: number): Promise<number> {
    return this.repository.countUnread(utilisateurId);
  }

  async markAsRead(id: number, utilisateurId: number): Promise<NotificationResponse> {
    const notification = await this.repository.markAsRead(id, utilisateurId);
    if (!notification) throw AppError.notFound('Notification introuvable');
    return this.mapToResponse(notification);
  }

  async markAllAsRead(utilisateurId: number): Promise<number> {
    return this.repository.markAllAsRead(utilisateurId);
  }

  async delete(id: number, utilisateurId: number): Promise<void> {
    const deleted = await this.repository.delete(id, utilisateurId);
    if (!deleted) throw AppError.notFound('Notification introuvable');
  }

  async createAlerte(input: CreateAlerteInput): Promise<number> {
    const exists = await this.repository.utilisateursExist(input.utilisateurIds);
    if (!exists) throw AppError.notFound('Un ou plusieurs utilisateurs sont introuvables ou inactifs');

    const notifications: CreateNotificationInput[] = input.utilisateurIds.map((utilisateurId) => ({
      utilisateurId,
      type: NotificationType.ALERTE,
      titre: input.titre,
      message: input.message,
    }));

    await this.repository.createMany(notifications);
    return notifications.length;
  }

  async notifyMany(inputs: CreateNotificationInput[]): Promise<void> {
    await this.repository.createMany(inputs);
  }

  private mapToResponse(row: NotificationRow): NotificationResponse {
    return {
      id: row.id,
      type: row.type as NotificationType,
      titre: row.titre,
      message: row.message,
      entiteType: row.entiteType as NotificationEntiteType | null,
      entiteId: row.entiteId,
      lu: row.lu,
      luAt: row.luAt,
      createdAt: row.createdAt,
    };
  }
}

export const notificationsService = new NotificationsService();
