import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { notifications } from '../../database/schema/notifications.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { roles } from '../../database/schema/roles.schema.js';
import type { RoleCode } from '../../shared/constants/roles.constants.js';
import type { INotificationsRepository } from './notifications.interfaces.js';
import type {
  CreateNotificationInput,
  NotificationFilters,
  NotificationListQuery,
  NotificationRow,
} from './notifications.types.js';

const notificationSelect = {
  id: notifications.id,
  utilisateurId: notifications.utilisateurId,
  type: notifications.type,
  titre: notifications.titre,
  message: notifications.message,
  entiteType: notifications.entiteType,
  entiteId: notifications.entiteId,
  lu: notifications.lu,
  luAt: notifications.luAt,
  createdAt: notifications.createdAt,
};

const buildWhereClause = (filters: NotificationFilters) => {
  const conditions = [eq(notifications.utilisateurId, filters.utilisateurId)];

  if (filters.type !== undefined) {
    conditions.push(eq(notifications.type, filters.type));
  }

  if (filters.lu !== undefined) {
    conditions.push(eq(notifications.lu, filters.lu));
  }

  return and(...conditions);
};

export class NotificationsRepository implements INotificationsRepository {
  async findAll(
    query: NotificationListQuery,
    filters: NotificationFilters,
  ): Promise<{ rows: NotificationRow[]; total: number }> {
    const where = buildWhereClause(filters);
    const sortColumn = query.sortBy === 'lu' ? notifications.lu : notifications.createdAt;
    const orderBy = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const offset = (query.page - 1) * query.limit;

    const [rows, totalResult] = await Promise.all([
      db
        .select(notificationSelect)
        .from(notifications)
        .where(where)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(offset),
      db.select({ total: count() }).from(notifications).where(where),
    ]);

    return { rows, total: totalResult[0]?.total ?? 0 };
  }

  async findById(id: number, utilisateurId: number): Promise<NotificationRow | null> {
    const [row] = await db
      .select(notificationSelect)
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.utilisateurId, utilisateurId)))
      .limit(1);
    return row ?? null;
  }

  async countUnread(utilisateurId: number): Promise<number> {
    const [result] = await db
      .select({ total: count() })
      .from(notifications)
      .where(and(eq(notifications.utilisateurId, utilisateurId), eq(notifications.lu, false)));
    return result?.total ?? 0;
  }

  async createMany(inputs: CreateNotificationInput[]): Promise<void> {
    if (inputs.length === 0) return;

    await db.insert(notifications).values(
      inputs.map((input) => ({
        utilisateurId: input.utilisateurId,
        type: input.type,
        titre: input.titre,
        message: input.message,
        entiteType: input.entiteType ?? null,
        entiteId: input.entiteId ?? null,
      })),
    );
  }

  async markAsRead(id: number, utilisateurId: number): Promise<NotificationRow | null> {
    await db
      .update(notifications)
      .set({ lu: true, luAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.utilisateurId, utilisateurId)));

    return this.findById(id, utilisateurId);
  }

  async markAllAsRead(utilisateurId: number): Promise<number> {
    const unread = await this.countUnread(utilisateurId);
    if (unread === 0) return 0;

    await db
      .update(notifications)
      .set({ lu: true, luAt: new Date() })
      .where(and(eq(notifications.utilisateurId, utilisateurId), eq(notifications.lu, false)));

    return unread;
  }

  async delete(id: number, utilisateurId: number): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.utilisateurId, utilisateurId)))
      .returning({ id: notifications.id });

    return result.length > 0;
  }

  async findActiveUserIdsByRoles(roleCodes: RoleCode[]): Promise<number[]> {
    if (roleCodes.length === 0) return [];

    const rows = await db
      .select({ id: utilisateurs.id })
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id))
      .where(and(eq(utilisateurs.actif, true), inArray(roles.code, roleCodes)));

    return rows.map((row) => row.id);
  }

  async utilisateursExist(ids: number[]): Promise<boolean> {
    if (ids.length === 0) return false;

    const [result] = await db
      .select({ total: count() })
      .from(utilisateurs)
      .where(and(eq(utilisateurs.actif, true), inArray(utilisateurs.id, ids)));

    return (result?.total ?? 0) === ids.length;
  }
}

export const notificationsRepository = new NotificationsRepository();
