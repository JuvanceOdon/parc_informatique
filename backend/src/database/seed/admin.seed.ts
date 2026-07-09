import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { roles } from '../../database/schema/roles.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { hashPassword } from '../../utils/password.util.js';
import { logger } from '../../utils/logger.js';

const DEFAULT_ADMIN = {
  matricule: 'ADMIN001',
  email: 'admin@mfar.gov.mg',
  motDePasse: 'Admin@123456',
  nom: 'Administrateur',
  prenom: 'Système',
  telephone: null,
};

export const seedAdminUser = async (): Promise<void> => {
  const [existing] = await db
    .select({ id: utilisateurs.id })
    .from(utilisateurs)
    .where(eq(utilisateurs.matricule, DEFAULT_ADMIN.matricule))
    .limit(1);

  if (existing) {
    logger.info('Admin user already exists, skipping seed');
    return;
  }

  const [adminRole] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.code, RoleCode.ADMIN))
    .limit(1);

  if (!adminRole) {
    throw new Error('Admin role not found. Run roles seed first.');
  }

  const hashedPassword = await hashPassword(DEFAULT_ADMIN.motDePasse);

  await db.insert(utilisateurs).values({
    matricule: DEFAULT_ADMIN.matricule,
    email: DEFAULT_ADMIN.email,
    motDePasse: hashedPassword,
    nom: DEFAULT_ADMIN.nom,
    prenom: DEFAULT_ADMIN.prenom,
    telephone: DEFAULT_ADMIN.telephone,
    roleId: adminRole.id,
    actif: true,
  });

  logger.info('Admin user seeded', {
    matricule: DEFAULT_ADMIN.matricule,
    email: DEFAULT_ADMIN.email,
  });
};
