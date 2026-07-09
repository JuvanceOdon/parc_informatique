import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { services } from '../../database/schema/services.schema.js';
import { logger } from '../../utils/logger.js';

const SERVICES_DATA = [
  {
    code: 'SVC-INFO',
    libelle: 'Service Informatique',
    description: 'Gestion du parc informatique et des infrastructures IT',
  },
  {
    code: 'SVC-RH',
    libelle: 'Service Ressources Humaines',
    description: 'Administration du personnel',
  },
  {
    code: 'SVC-LOG',
    libelle: 'Service Logistique',
    description: 'Approvisionnement et logistique générale',
  },
];

export const seedServices = async (): Promise<void> => {
  for (const service of SERVICES_DATA) {
    const [existing] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.code, service.code))
      .limit(1);

    if (!existing) {
      await db.insert(services).values(service);
      logger.info(`Service seeded: ${service.code}`);
    }
  }
};
