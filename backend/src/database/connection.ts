import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool);

export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error });
    return false;
  }
};

let poolClosed = false;

export const closeDatabaseConnection = async (): Promise<void> => {
  if (poolClosed) return;
  poolClosed = true;
  await pool.end();
  logger.info('Database connection pool closed');
};

export { pool };
