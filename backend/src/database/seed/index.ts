import { logger } from '../../utils/logger.js';
import { closeDatabaseConnection, testDatabaseConnection } from '../connection.js';
import { resetDemoData } from './reset.seed.js';
import { seedRoles } from './roles.seed.js';
import { seedServices } from './services.seed.js';
import { seedCategories } from './categories.seed.js';
import { seedDemoUsers } from './users.seed.js';
import { seedMateriels } from './materiels.seed.js';
import { seedAffectations } from './affectations.seed.js';
import { seedTickets } from './tickets.seed.js';
import { seedMaintenances } from './maintenances.seed.js';

const runSeed = async (): Promise<void> => {
  const connected = await testDatabaseConnection();
  if (!connected) {
    throw new Error('Database connection failed. Cannot run seed.');
  }

  const shouldReset = process.env.DEMO_RESET !== 'false';

  logger.info('Starting database seed...', { reset: shouldReset });

  if (shouldReset) {
    await resetDemoData();
  }

  await seedRoles();
  await seedServices();
  await seedCategories();
  await seedDemoUsers();
  await seedMateriels();
  await seedAffectations();
  await seedTickets();
  await seedMaintenances();

  logger.info('Database seed completed successfully');
  logger.info('Comptes démo : voir docs/COMPTES_DEMO.md');
};

runSeed()
  .then(async () => {
    await closeDatabaseConnection();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error('Seed failed', { error });
    await closeDatabaseConnection();
    process.exit(1);
  });
