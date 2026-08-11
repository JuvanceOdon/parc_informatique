import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { roles } from '../../database/schema/roles.schema.js';
import { services } from '../../database/schema/services.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { hashPassword } from '../../utils/password.util.js';
import { logger } from '../../utils/logger.js';

/** Mot de passe commun des comptes de démonstration (hors admin système). */
export const DEMO_PASSWORD = 'Demo@123456';

export const ADMIN_PASSWORD = 'Admin@123456';

type DemoUser = {
  matricule: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  roleCode: RoleCode;
  serviceCode: string | null;
  responsableDuService?: boolean;
  password?: string;
};

const DEMO_USERS: DemoUser[] = [
  {
    matricule: 'ADMIN001',
    email: 'admin@mfar.gov.mg',
    nom: 'Ramanantsoa',
    prenom: 'Andry',
    telephone: '0341100001',
    roleCode: RoleCode.ADMIN,
    serviceCode: null,
    password: ADMIN_PASSWORD,
  },
  {
    matricule: 'RESP001',
    email: 'responsable.info@mfar.gov.mg',
    nom: 'Rakoto',
    prenom: 'Jean',
    telephone: '0341100010',
    roleCode: RoleCode.CHEF_SERVICE,
    serviceCode: 'SVC-INFO',
    responsableDuService: true,
  },
  {
    matricule: 'CHEF001',
    email: 'chef.rh@mfar.gov.mg',
    nom: 'Rasoanaivo',
    prenom: 'Marie',
    telephone: '0341100020',
    roleCode: RoleCode.CHEF_SERVICE,
    serviceCode: 'SVC-RH',
    responsableDuService: true,
  },
  {
    matricule: 'CHEF002',
    email: 'chef.log@mfar.gov.mg',
    nom: 'Randrianarisoa',
    prenom: 'Hery',
    telephone: '0341100030',
    roleCode: RoleCode.CHEF_SERVICE,
    serviceCode: 'SVC-LOG',
    responsableDuService: true,
  },
  {
    matricule: 'TECH001',
    email: 'technicien@mfar.gov.mg',
    nom: 'Andrianina',
    prenom: 'Paul',
    telephone: '0341100040',
    roleCode: RoleCode.TECHNICIEN,
    serviceCode: 'SVC-INFO',
  },
  {
    matricule: 'TECH002',
    email: 'technicien2@mfar.gov.mg',
    nom: 'Rakotomalala',
    prenom: 'Lova',
    telephone: '0341100041',
    roleCode: RoleCode.TECHNICIEN,
    serviceCode: 'SVC-INFO',
  },
  {
    matricule: 'USER001',
    email: 'utilisateur@mfar.gov.mg',
    nom: 'Razafy',
    prenom: 'Sophie',
    telephone: '0341100050',
    roleCode: RoleCode.UTILISATEUR,
    serviceCode: 'SVC-RH',
  },
  {
    matricule: 'USER002',
    email: 'utilisateur.log@mfar.gov.mg',
    nom: 'Ravelo',
    prenom: 'Mamy',
    telephone: '0341100051',
    roleCode: RoleCode.UTILISATEUR,
    serviceCode: 'SVC-LOG',
  },
  {
    matricule: 'USER003',
    email: 'utilisateur.info@mfar.gov.mg',
    nom: 'Rajaonarison',
    prenom: 'Fara',
    telephone: '0341100052',
    roleCode: RoleCode.UTILISATEUR,
    serviceCode: 'SVC-INFO',
  },
];

export const seedDemoUsers = async (): Promise<void> => {
  for (const demo of DEMO_USERS) {
    const hashedPassword = await hashPassword(demo.password ?? DEMO_PASSWORD);

    const [role] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.code, demo.roleCode))
      .limit(1);

    if (!role) {
      throw new Error(`Role ${demo.roleCode} not found. Run roles seed first.`);
    }

    let serviceId: number | null = null;
    if (demo.serviceCode) {
      const [service] = await db
        .select({ id: services.id })
        .from(services)
        .where(eq(services.code, demo.serviceCode))
        .limit(1);

      if (!service) {
        throw new Error(`Service ${demo.serviceCode} not found. Run services seed first.`);
      }
      serviceId = service.id;
    }

    const [created] = await db
      .insert(utilisateurs)
      .values({
        matricule: demo.matricule,
        email: demo.email,
        motDePasse: hashedPassword,
        nom: demo.nom,
        prenom: demo.prenom,
        telephone: demo.telephone,
        roleId: role.id,
        serviceId,
        actif: true,
      })
      .returning({ id: utilisateurs.id });

    if (demo.responsableDuService && serviceId && created?.id) {
      await db
        .update(services)
        .set({ responsableId: created.id, updatedAt: new Date() })
        .where(eq(services.id, serviceId));
    }

    logger.info('Demo user seeded', {
      matricule: demo.matricule,
      role: demo.roleCode,
      service: demo.serviceCode,
    });
  }
};
