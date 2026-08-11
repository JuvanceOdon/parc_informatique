import { sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';

/**
 * Vide toutes les tables métier pour repartir d'un jeu de démo propre.
 * L'ordre n'importe pas grâce à CASCADE.
 */
export const resetDemoData = async (): Promise<void> => {
  logger.info('Resetting database for demo...');

  await db.execute(sql`
    TRUNCATE TABLE
      refresh_tokens,
      journal_audit,
      notifications,
      maintenance_historique,
      maintenances,
      ticket_historique,
      ticket_pieces_jointes,
      ticket_commentaires,
      tickets,
      affectations,
      materiel_historique,
      materiel_images,
      materiels,
      utilisateurs,
      categories,
      services,
      roles
    RESTART IDENTITY CASCADE
  `);

  logger.info('Database truncated successfully');
};
