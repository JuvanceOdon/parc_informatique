import type {
  NotificationEntiteType,
  NotificationType,
} from '../../shared/constants/notification.constants.js';

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  titre: string;
  message: string;
  entiteType: NotificationEntiteType | null;
  entiteId: number | null;
  lu: boolean;
  luAt: Date | null;
  createdAt: Date;
}

export interface NotificationListQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface NotificationFilters {
  utilisateurId: number;
  type?: NotificationType;
  lu?: boolean;
}

export interface CreateNotificationInput {
  utilisateurId: number;
  type: NotificationType;
  titre: string;
  message: string;
  entiteType?: NotificationEntiteType | null;
  entiteId?: number | null;
}

export interface CreateAlerteInput {
  utilisateurIds: number[];
  titre: string;
  message: string;
}

export interface NotificationRow {
  id: number;
  utilisateurId: number;
  type: string;
  titre: string;
  message: string;
  entiteType: string | null;
  entiteId: number | null;
  lu: boolean;
  luAt: Date | null;
  createdAt: Date;
}
