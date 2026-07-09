import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { roles } from '../../database/schema/roles.schema.js';
import { RoleCode, ROLE_LABELS } from '../../shared/constants/roles.constants.js';
import { logger } from '../../utils/logger.js';

const ROLES_DATA = [
  {
    code: RoleCode.ADMIN,
    libelle: ROLE_LABELS[RoleCode.ADMIN],
    description: 'Administration complète du système',
  },
  {
    code: RoleCode.CHEF_SERVICE,
    libelle: ROLE_LABELS[RoleCode.CHEF_SERVICE],
    description: 'Gestion du service et supervision des équipes',
  },
  {
    code: RoleCode.TECHNICIEN,
    libelle: ROLE_LABELS[RoleCode.TECHNICIEN],
    description: 'Interventions techniques et maintenance',
  },
  {
    code: RoleCode.UTILISATEUR,
    libelle: ROLE_LABELS[RoleCode.UTILISATEUR],
    description: 'Consultation et création de tickets',
  },
];

export const seedRoles = async (): Promise<void> => {
  for (const role of ROLES_DATA) {
    const [existing] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.code, role.code))
      .limit(1);

    if (!existing) {
      await db.insert(roles).values(role);
      logger.info(`Role seeded: ${role.code}`);
    }
  }
};
