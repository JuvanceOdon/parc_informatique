import { and, count, desc, eq, gte, inArray, lte, or, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { tickets } from '../../database/schema/tickets.schema.js';
import { maintenances } from '../../database/schema/maintenances.schema.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { affectations } from '../../database/schema/affectations.schema.js';
import {
  MaintenanceStatut,
  MaintenanceType,
  MAINTENANCE_TYPE_LABELS,
  MAINTENANCE_STATUT_LABELS,
} from '../../shared/constants/maintenance.constants.js';
import {
  TICKET_PRIORITE_LABELS,
  TICKET_STATUT_LABELS,
} from '../../shared/constants/ticket.constants.js';
import { AffectationStatut } from '../../shared/constants/affectation.constants.js';
import type {
  RapportActivite,
  RapportMaintenanceLigne,
  RapportTicketLigne,
} from './rapports.types.js';

export class RapportsRepository {
  async getActivitePeriode(dateDebut: Date, dateFin: Date): Promise<RapportActivite> {
    const [
      ticketsCrees,
      ticketsResolus,
      ticketsFermes,
      maintenancesDemarrees,
      maintenancesTerminees,
      maintenancesPreventives,
      maintenancesCorrectives,
      affectationsCrees,
      affectationsTerminees,
    ] = await Promise.all([
      db
        .select({ total: count() })
        .from(tickets)
        .where(and(gte(tickets.createdAt, dateDebut), lte(tickets.createdAt, dateFin))),
      db
        .select({ total: count() })
        .from(tickets)
        .where(
          and(
            sql`${tickets.dateResolution} IS NOT NULL`,
            gte(tickets.dateResolution, dateDebut),
            lte(tickets.dateResolution, dateFin),
          ),
        ),
      db
        .select({ total: count() })
        .from(tickets)
        .where(
          and(
            sql`${tickets.dateFermeture} IS NOT NULL`,
            gte(tickets.dateFermeture, dateDebut),
            lte(tickets.dateFermeture, dateFin),
          ),
        ),
      db
        .select({ total: count() })
        .from(maintenances)
        .where(
          and(
            sql`${maintenances.dateDebut} IS NOT NULL`,
            gte(maintenances.dateDebut, dateDebut),
            lte(maintenances.dateDebut, dateFin),
          ),
        ),
      db
        .select({ total: count() })
        .from(maintenances)
        .where(
          and(
            eq(maintenances.statut, MaintenanceStatut.TERMINEE),
            sql`${maintenances.dateFin} IS NOT NULL`,
            gte(maintenances.dateFin, dateDebut),
            lte(maintenances.dateFin, dateFin),
          ),
        ),
      db
        .select({ total: count() })
        .from(maintenances)
        .where(
          and(
            eq(maintenances.type, MaintenanceType.PREVENTIVE),
            sql`${maintenances.dateDebut} IS NOT NULL`,
            gte(maintenances.dateDebut, dateDebut),
            lte(maintenances.dateDebut, dateFin),
          ),
        ),
      db
        .select({ total: count() })
        .from(maintenances)
        .where(
          and(
            eq(maintenances.type, MaintenanceType.CORRECTIVE),
            sql`${maintenances.dateDebut} IS NOT NULL`,
            gte(maintenances.dateDebut, dateDebut),
            lte(maintenances.dateDebut, dateFin),
          ),
        ),
      db
        .select({ total: count() })
        .from(affectations)
        .where(and(gte(affectations.createdAt, dateDebut), lte(affectations.createdAt, dateFin))),
      db
        .select({ total: count() })
        .from(affectations)
        .where(
          and(
            inArray(affectations.statut, [
              AffectationStatut.TERMINEE,
              AffectationStatut.TRANSFEREE,
            ]),
            sql`${affectations.dateFin} IS NOT NULL`,
            gte(affectations.dateFin, dateDebut),
            lte(affectations.dateFin, dateFin),
          ),
        ),
    ]);

    return {
      ticketsCrees: ticketsCrees[0]?.total ?? 0,
      ticketsResolus: ticketsResolus[0]?.total ?? 0,
      ticketsFermes: ticketsFermes[0]?.total ?? 0,
      maintenancesDemarrees: maintenancesDemarrees[0]?.total ?? 0,
      maintenancesTerminees: maintenancesTerminees[0]?.total ?? 0,
      maintenancesPreventives: maintenancesPreventives[0]?.total ?? 0,
      maintenancesCorrectives: maintenancesCorrectives[0]?.total ?? 0,
      affectationsCrees: affectationsCrees[0]?.total ?? 0,
      affectationsTerminees: affectationsTerminees[0]?.total ?? 0,
    };
  }

  async getTicketsPeriode(dateDebut: Date, dateFin: Date, limit = 50): Promise<RapportTicketLigne[]> {
    const rows = await db
      .select({
        numeroTicket: tickets.numeroTicket,
        titre: tickets.titre,
        statut: tickets.statut,
        priorite: tickets.priorite,
        dateCreation: tickets.createdAt,
      })
      .from(tickets)
      .where(
        or(
          and(gte(tickets.createdAt, dateDebut), lte(tickets.createdAt, dateFin)),
          and(
            sql`${tickets.dateResolution} IS NOT NULL`,
            gte(tickets.dateResolution, dateDebut),
            lte(tickets.dateResolution, dateFin),
          ),
        ),
      )
      .orderBy(desc(tickets.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      numeroTicket: row.numeroTicket,
      titre: row.titre,
      statut: TICKET_STATUT_LABELS[row.statut as keyof typeof TICKET_STATUT_LABELS] ?? row.statut,
      priorite:
        TICKET_PRIORITE_LABELS[row.priorite as keyof typeof TICKET_PRIORITE_LABELS] ?? row.priorite,
      dateCreation: row.dateCreation,
    }));
  }

  async getMaintenancesPeriode(
    dateDebut: Date,
    dateFin: Date,
    limit = 50,
  ): Promise<RapportMaintenanceLigne[]> {
    const rows = await db
      .select({
        numeroMaintenance: maintenances.numeroMaintenance,
        titre: maintenances.titre,
        type: maintenances.type,
        statut: maintenances.statut,
        materielCode: materiels.codeMateriel,
        dateDebut: maintenances.dateDebut,
        dateFin: maintenances.dateFin,
      })
      .from(maintenances)
      .innerJoin(materiels, eq(maintenances.materielId, materiels.id))
      .where(
        or(
          and(
            sql`${maintenances.dateDebut} IS NOT NULL`,
            gte(maintenances.dateDebut, dateDebut),
            lte(maintenances.dateDebut, dateFin),
          ),
          and(
            sql`${maintenances.dateFin} IS NOT NULL`,
            gte(maintenances.dateFin, dateDebut),
            lte(maintenances.dateFin, dateFin),
          ),
        ),
      )
      .orderBy(desc(maintenances.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      numeroMaintenance: row.numeroMaintenance,
      titre: row.titre,
      type: MAINTENANCE_TYPE_LABELS[row.type as MaintenanceType] ?? row.type,
      statut: MAINTENANCE_STATUT_LABELS[row.statut as MaintenanceStatut] ?? row.statut,
      materielCode: row.materielCode,
      dateDebut: row.dateDebut,
      dateFin: row.dateFin,
    }));
  }
}

export const rapportsRepository = new RapportsRepository();
