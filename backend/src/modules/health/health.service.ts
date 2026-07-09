import type { HealthCheckData } from '../../shared/types/index.js';
import { testDatabaseConnection } from '../../database/connection.js';
import { config } from '../../config/index.js';

export class HealthService {
  async getHealthStatus(): Promise<HealthCheckData> {
    const dbConnected = await testDatabaseConnection();

    return {
      status: dbConnected ? 'ok' : 'degraded',
      app: config.app.name,
      environment: config.app.env,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: dbConnected ? 'connected' : 'disconnected',
      },
    };
  }
}

export const healthService = new HealthService();
