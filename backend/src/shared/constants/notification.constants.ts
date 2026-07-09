export enum NotificationType {
  NOUVEAU_TICKET = 'NOUVEAU_TICKET',
  AFFECTATION = 'AFFECTATION',
  INTERVENTION = 'INTERVENTION',
  FIN_MAINTENANCE = 'FIN_MAINTENANCE',
  ALERTE = 'ALERTE',
}

export enum NotificationEntiteType {
  TICKET = 'TICKET',
  AFFECTATION = 'AFFECTATION',
  MAINTENANCE = 'MAINTENANCE',
  MATERIEL = 'MATERIEL',
}

export const NOTIFICATION_TYPES = Object.values(NotificationType);

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.NOUVEAU_TICKET]: 'Nouveau ticket',
  [NotificationType.AFFECTATION]: 'Affectation',
  [NotificationType.INTERVENTION]: 'Intervention',
  [NotificationType.FIN_MAINTENANCE]: 'Fin de maintenance',
  [NotificationType.ALERTE]: 'Alerte',
};
