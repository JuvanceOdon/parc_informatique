import type {
  CreateNotificationInput,
  NotificationFilters,
  NotificationListQuery,
  NotificationRow,
} from './notifications.types.js';
import type { RoleCode } from '../../shared/constants/roles.constants.js';

export interface INotificationsRepository {
  findAll(
    query: NotificationListQuery,
    filters: NotificationFilters,
  ): Promise<{ rows: NotificationRow[]; total: number }>;
  findById(id: number, utilisateurId: number): Promise<NotificationRow | null>;
  countUnread(utilisateurId: number): Promise<number>;
  createMany(inputs: CreateNotificationInput[]): Promise<void>;
  markAsRead(id: number, utilisateurId: number): Promise<NotificationRow | null>;
  markAllAsRead(utilisateurId: number): Promise<number>;
  delete(id: number, utilisateurId: number): Promise<boolean>;
  findActiveUserIdsByRoles(roleCodes: RoleCode[]): Promise<number[]>;
  utilisateursExist(ids: number[]): Promise<boolean>;
}
