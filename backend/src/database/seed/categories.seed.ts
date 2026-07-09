import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { categories } from '../../database/schema/categories.schema.js';
import { logger } from '../../utils/logger.js';

const CATEGORIES_DATA = [
  { code: 'ORDINATEUR', libelle: 'Ordinateur', description: 'PC de bureau et portables' },
  { code: 'IMPRIMANTE', libelle: 'Imprimante', description: 'Imprimantes et multifonctions' },
  { code: 'SERVEUR', libelle: 'Serveur', description: 'Serveurs et baies de stockage' },
  { code: 'RESEAU', libelle: 'Équipement réseau', description: 'Switchs, routeurs, points d\'accès' },
  { code: 'PERIPHERIQUE', libelle: 'Périphérique', description: 'Claviers, souris, écrans' },
  { code: 'MOBILE', libelle: 'Appareil mobile', description: 'Tablettes et smartphones' },
];

export const seedCategories = async (): Promise<void> => {
  for (const categorie of CATEGORIES_DATA) {
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.code, categorie.code))
      .limit(1);

    if (!existing) {
      await db.insert(categories).values(categorie);
      logger.info(`Category seeded: ${categorie.code}`);
    }
  }
};
