import { closeDatabaseConnection } from '../database/connection.js';

export default async (): Promise<void> => {
  await closeDatabaseConnection();
};
