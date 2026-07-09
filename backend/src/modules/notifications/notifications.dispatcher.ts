import { logger } from '../../utils/logger.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import {
  NotificationEntiteType,
  NotificationType,
} from '../../shared/constants/notification.constants.js';
import { notificationsService } from './notifications.service.js';
import { notificationsRepository } from './notifications.repository.js';

const STAFF_ROLES = [RoleCode.ADMIN, RoleCode.CHEF_SERVICE, RoleCode.TECHNICIEN];

const excludeUser = (userIds: number[], excludeId?: number): number[] => {
  if (!excludeId) return userIds;
  return userIds.filter((id) => id !== excludeId);
};

export const notificationDispatcher = {
  async onTicketCreated(data: {
    ticketId: number;
    numeroTicket: string;
    titre: string;
    demandeurId: number;
  }): Promise<void> {
    try {
      const staffIds = excludeUser(
        await notificationsRepository.findActiveUserIdsByRoles(STAFF_ROLES),
        data.demandeurId,
      );

      if (staffIds.length === 0) return;

      await notificationsService.notifyMany(
        staffIds.map((utilisateurId) => ({
          utilisateurId,
          type: NotificationType.NOUVEAU_TICKET,
          titre: 'Nouveau ticket',
          message: `Ticket ${data.numeroTicket} — ${data.titre}`,
          entiteType: NotificationEntiteType.TICKET,
          entiteId: data.ticketId,
        })),
      );
    } catch (error) {
      logger.error('Échec notification nouveau ticket', { error, ticketId: data.ticketId });
    }
  },

  async onAffectationCreated(data: {
    affectationId: number;
    utilisateurId: number;
    materielCode: string;
    materielDesignation: string;
  }): Promise<void> {
    try {
      await notificationsService.notifyMany([
        {
          utilisateurId: data.utilisateurId,
          type: NotificationType.AFFECTATION,
          titre: 'Nouvelle affectation',
          message: `Le matériel ${data.materielCode} (${data.materielDesignation}) vous a été affecté`,
          entiteType: NotificationEntiteType.AFFECTATION,
          entiteId: data.affectationId,
        },
      ]);
    } catch (error) {
      logger.error('Échec notification affectation', { error, affectationId: data.affectationId });
    }
  },

  async onAffectationTransfer(data: {
    affectationId: number;
    utilisateurId: number;
    materielCode: string;
    materielDesignation: string;
  }): Promise<void> {
    try {
      await notificationsService.notifyMany([
        {
          utilisateurId: data.utilisateurId,
          type: NotificationType.AFFECTATION,
          titre: 'Transfert de matériel',
          message: `Le matériel ${data.materielCode} (${data.materielDesignation}) vous a été transféré`,
          entiteType: NotificationEntiteType.AFFECTATION,
          entiteId: data.affectationId,
        },
      ]);
    } catch (error) {
      logger.error('Échec notification transfert', { error, affectationId: data.affectationId });
    }
  },

  async onMaintenanceStarted(data: {
    maintenanceId: number;
    numeroMaintenance: string;
    titre: string;
    materielCode: string;
    technicienId: number | null;
  }): Promise<void> {
    try {
      const recipientIds = new Set<number>();

      if (data.technicienId) {
        recipientIds.add(data.technicienId);
      } else {
        const staffIds = await notificationsRepository.findActiveUserIdsByRoles(STAFF_ROLES);
        staffIds.forEach((id) => recipientIds.add(id));
      }

      if (recipientIds.size === 0) return;

      await notificationsService.notifyMany(
        [...recipientIds].map((utilisateurId) => ({
          utilisateurId,
          type: NotificationType.INTERVENTION,
          titre: 'Intervention démarrée',
          message: `Maintenance ${data.numeroMaintenance} — ${data.titre} (${data.materielCode})`,
          entiteType: NotificationEntiteType.MAINTENANCE,
          entiteId: data.maintenanceId,
        })),
      );
    } catch (error) {
      logger.error('Échec notification intervention', { error, maintenanceId: data.maintenanceId });
    }
  },

  async onMaintenanceCompleted(data: {
    maintenanceId: number;
    numeroMaintenance: string;
    titre: string;
    materielCode: string;
    createdById: number;
    technicienId: number | null;
  }): Promise<void> {
    try {
      const recipientIds = new Set<number>([data.createdById]);
      if (data.technicienId) recipientIds.add(data.technicienId);

      await notificationsService.notifyMany(
        [...recipientIds].map((utilisateurId) => ({
          utilisateurId,
          type: NotificationType.FIN_MAINTENANCE,
          titre: 'Maintenance terminée',
          message: `La maintenance ${data.numeroMaintenance} — ${data.titre} (${data.materielCode}) est terminée`,
          entiteType: NotificationEntiteType.MAINTENANCE,
          entiteId: data.maintenanceId,
        })),
      );
    } catch (error) {
      logger.error('Échec notification fin maintenance', {
        error,
        maintenanceId: data.maintenanceId,
      });
    }
  },
};
