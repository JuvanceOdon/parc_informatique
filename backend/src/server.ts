import { createApp } from './app.js';
import { config } from './config/index.js';
import { closeDatabaseConnection, testDatabaseConnection } from './database/connection.js';
import { logger } from './utils/logger.js';

const startServer = async (): Promise<void> => {
  const app = createApp();

  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    logger.warn('Server starting without active database connection');
  }

  const server = app.listen(config.app.port, () => {
    logger.info(`${config.app.name} started`, {
      port: config.app.port,
      environment: config.app.env,
      apiPrefix: config.app.apiPrefix,
    });
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      try {
        await closeDatabaseConnection();
        logger.info('Server closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error });
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error });
    process.exit(1);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
