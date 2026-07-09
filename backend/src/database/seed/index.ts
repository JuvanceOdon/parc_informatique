import { logger } from '../../utils/logger.js';
import { closeDatabaseConnection, testDatabaseConnection } from '../connection.js';
import { seedRoles } from './roles.seed.js';
import { seedAdminUser } from './admin.seed.js';
import { seedServices } from './services.seed.js';
import { seedCategories } from './categories.seed.js';

const runSeed = async (): Promise<void> => {
  const connected = await testDatabaseConnection();
  if (!connected) {
    throw new Error('Database connection failed. Cannot run seed.');
  }

  logger.info('Starting database seed...');

  await seedRoles();
  await seedServices();
  await seedCategories();
  await seedAdminUser();

  logger.info('Database seed completed successfully');
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
