import { and, count, eq, gte, inArray, lte, ne, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { categories } from '../../database/schema/categories.schema.js';
import { services } from '../../database/schema/services.schema.js';
import { tickets } from '../../database/schema/tickets.schema.js';
import { maintenances } from '../../database/schema/maintenances.schema.js';
import { affectations } from '../../database/schema/affectations.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { MaterielStatut } from '../../shared/constants/materiel.constants.js';
import {
  MATERIEL_ETAT_LABELS,
  MATERIEL_STATUT_LABELS,
} from '../../shared/constants/materiel.constants.js';
import {
  TICKET_PRIORITE_LABELS,
  TICKET_STATUT_LABELS,
  TicketStatut,
} from '../../shared/constants/ticket.constants.js';
import { MaintenanceStatut, MaintenanceType } from '../../shared/constants/maintenance.constants.js';
import { AffectationStatut } from '../../shared/constants/affectation.constants.js';
import type { IDashboardRepository } from './dashboard.interfaces.js';
import type {
  DashboardKpi,
  GroupCountRow,
  MonthlyTicketCountRow,
  MonthlyTypeCountRow,
} from './dashboard.types.js';

const ACTIVE_MATERIEL_CONDITION = and(
  eq(materiels.actif, true),
  ne(materiels.statut, MaterielStatut.REFORME),
);

const getToday = (): string => new Date().toISOString().slice(0, 10);

const getDateInDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const getMonthStartMonthsAgo = (months: number): Date => {
  const date = new Date();
  date.setMonth(date.getMonth() - months + 1);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const roundRate = (value: number): number => Math.round(value * 100) / 100;

export class DashboardRepository implements IDashboardRepository {
  async getKpi(): Promise<DashboardKpi> {
    const today = getToday();
    const in30Days = getDateInDays(30);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      materielStats,
      ticketStats,
      maintenanceStats,
      affectationStats,
      utilisateurStats,
      garantieStats,
    ] = await Promise.all([
      db
        .select({
          statut: materiels.statut,
          total: count(),
        })
        .from(materiels)
        .where(ACTIVE_MATERIEL_CONDITION)
        .groupBy(materiels.statut),
      db
        .select({
          statut: tickets.statut,
          total: count(),
        })
        .from(tickets)
        .groupBy(tickets.statut),
      db
        .select({
          statut: maintenances.statut,
          total: count(),
        })
        .from(maintenances)
        .groupBy(maintenances.statut),
      db
        .select({ total: count() })
        .from(affectations)
        .where(eq(affectations.statut, AffectationStatut.ACTIVE)),
      db
        .select({ total: count() })
        .from(utilisateurs)
        .where(eq(utilisateurs.actif, true)),
      db
        .select({ total: count() })
        .from(materiels)
        .where(
          and(
            ACTIVE_MATERIEL_CONDITION,
            sql`${materiels.dateFinGarantie} IS NOT NULL`,
            gte(materiels.dateFinGarantie, today),
            lte(materiels.dateFinGarantie, in30Days),
          ),
        ),
    ]);

    const materielByStatut = Object.fromEntries(
      materielStats.map((row) => [row.statut, row.total]),
    );

    const totalMateriels = materielStats.reduce((sum, row) => sum + row.total, 0);
    const enService = materielByStatut[MaterielStatut.EN_SERVICE] ?? 0;
    const enStock = materielByStatut[MaterielStatut.EN_STOCK] ?? 0;
    const enMaintenance = materielByStatut[MaterielStatut.EN_MAINTENANCE] ?? 0;
    const horsService = materielByStatut[MaterielStatut.HORS_SERVICE] ?? 0;
    const disponibles = enService + enStock;

    const ticketByStatut = Object.fromEntries(ticketStats.map((row) => [row.statut, row.total]));
    const ticketsTotal = ticketStats.reduce((sum, row) => sum + row.total, 0);

    const maintenanceByStatut = Object.fromEntries(
      maintenanceStats.map((row) => [row.statut, row.total]),
    );

    const maintenancesEnCours =
      (maintenanceByStatut[MaintenanceStatut.PLANIFIEE] ?? 0) +
      (maintenanceByStatut[MaintenanceStatut.EN_COURS] ?? 0) +
      (maintenanceByStatut[MaintenanceStatut.DIAGNOSTIC] ?? 0);

    const [maintenancesTermineesMoisResult] = await db
      .select({ total: count() })
      .from(maintenances)
      .where(
        and(
          eq(maintenances.statut, MaintenanceStatut.TERMINEE),
          gte(maintenances.dateFin, monthStart),
        ),
      );

    return {
      totalMateriels,
      materielsActifs: totalMateriels,
      materielsEnService: enService,
      materielsEnStock: enStock,
      materielsEnMaintenance: enMaintenance,
      materielsHorsService: horsService,
      tauxDisponibilite:
        totalMateriels > 0 ? roundRate((disponibles / totalMateriels) * 100) : 100,
      ticketsTotal,
      ticketsOuverts: ticketByStatut[TicketStatut.OUVERT] ?? 0,
      ticketsEnCours: ticketByStatut[TicketStatut.EN_COURS] ?? 0,
      ticketsResolus:
        (ticketByStatut[TicketStatut.RESOLU] ?? 0) + (ticketByStatut[TicketStatut.FERME] ?? 0),
      maintenancesEnCours,
      maintenancesTermineesMois: maintenancesTermineesMoisResult?.total ?? 0,
      affectationsActives: affectationStats[0]?.total ?? 0,
      utilisateursActifs: utilisateurStats[0]?.total ?? 0,
      garantiesExpirant30Jours: garantieStats[0]?.total ?? 0,
    };
  }

  async getMaterielRepartitionByStatut(): Promise<GroupCountRow[]> {
    const rows = await db
      .select({ key: materiels.statut, count: count() })
      .from(materiels)
      .where(ACTIVE_MATERIEL_CONDITION)
      .groupBy(materiels.statut);

    return rows.map((row) => ({
      key: row.key,
      label: MATERIEL_STATUT_LABELS[row.key as MaterielStatut] ?? row.key,
      count: row.count,
      code: row.key,
    }));
  }

  async getMaterielRepartitionByEtat(): Promise<GroupCountRow[]> {
    const rows = await db
      .select({ key: materiels.etat, count: count() })
      .from(materiels)
      .where(ACTIVE_MATERIEL_CONDITION)
      .groupBy(materiels.etat);

    return rows.map((row) => ({
      key: row.key,
      label: MATERIEL_ETAT_LABELS[row.key as keyof typeof MATERIEL_ETAT_LABELS] ?? row.key,
      count: row.count,
      code: row.key,
    }));
  }

  async getMaterielRepartitionByCategorie(): Promise<GroupCountRow[]> {
    const rows = await db
      .select({
        id: categories.id,
        key: categories.code,
        label: categories.libelle,
        count: count(),
      })
      .from(materiels)
      .innerJoin(categories, eq(materiels.categorieId, categories.id))
      .where(ACTIVE_MATERIEL_CONDITION)
      .groupBy(categories.id, categories.code, categories.libelle)
      .orderBy(categories.libelle);

    return rows.map((row) => ({
      key: row.key,
      label: row.label,
      count: row.count,
      id: row.id,
    }));
  }

  async getMaterielRepartitionByService(): Promise<GroupCountRow[]> {
    const rows = await db
      .select({
        id: services.id,
        key: services.code,
        label: services.libelle,
        count: count(),
      })
      .from(materiels)
      .innerJoin(services, eq(materiels.serviceId, services.id))
      .where(ACTIVE_MATERIEL_CONDITION)
      .groupBy(services.id, services.code, services.libelle)
      .orderBy(services.libelle);

    return rows.map((row) => ({
      key: row.key,
      label: row.label,
      count: row.count,
      id: row.id,
    }));
  }

  async getTicketRepartitionByStatut(): Promise<GroupCountRow[]> {
    const rows = await db
      .select({ key: tickets.statut, count: count() })
      .from(tickets)
      .groupBy(tickets.statut);

    return rows.map((row) => ({
      key: row.key,
      label: TICKET_STATUT_LABELS[row.key as TicketStatut] ?? row.key,
      count: row.count,
      code: row.key,
    }));
  }

  async getTicketRepartitionByPriorite(): Promise<GroupCountRow[]> {
    const rows = await db
      .select({ key: tickets.priorite, count: count() })
      .from(tickets)
      .groupBy(tickets.priorite);

    return rows.map((row) => ({
      key: row.key,
      label: TICKET_PRIORITE_LABELS[row.key as keyof typeof TICKET_PRIORITE_LABELS] ?? row.key,
      count: row.count,
      code: row.key,
    }));
  }

  async getInterventionsMensuelles(months: number): Promise<MonthlyTypeCountRow[]> {
    const fromDate = getMonthStartMonthsAgo(months);

    const rows = await db
      .select({
        mois: sql<string>`to_char(${maintenances.dateDebut}, 'YYYY-MM')`,
        type: maintenances.type,
        count: count(),
      })
      .from(maintenances)
      .where(
        and(
          sql`${maintenances.dateDebut} IS NOT NULL`,
          gte(maintenances.dateDebut, fromDate),
          inArray(maintenances.type, [MaintenanceType.PREVENTIVE, MaintenanceType.CORRECTIVE]),
        ),
      )
      .groupBy(sql`to_char(${maintenances.dateDebut}, 'YYYY-MM')`, maintenances.type)
      .orderBy(sql`to_char(${maintenances.dateDebut}, 'YYYY-MM')`);

    return rows.map((row) => ({
      mois: row.mois,
      type: row.type,
      count: row.count,
    }));
  }

  async getTicketsParMois(months: number): Promise<MonthlyTicketCountRow[]> {
    const fromDate = getMonthStartMonthsAgo(months);

    const createdRows = await db
      .select({
        mois: sql<string>`to_char(${tickets.createdAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(tickets)
      .where(gte(tickets.createdAt, fromDate))
      .groupBy(sql`to_char(${tickets.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${tickets.createdAt}, 'YYYY-MM')`);

    const resolvedRows = await db
      .select({
        mois: sql<string>`to_char(${tickets.dateResolution}, 'YYYY-MM')`,
        count: count(),
      })
      .from(tickets)
      .where(
        and(
          sql`${tickets.dateResolution} IS NOT NULL`,
          gte(tickets.dateResolution, fromDate),
        ),
      )
      .groupBy(sql`to_char(${tickets.dateResolution}, 'YYYY-MM')`);

    const closedRows = await db
      .select({
        mois: sql<string>`to_char(${tickets.dateFermeture}, 'YYYY-MM')`,
        count: count(),
      })
      .from(tickets)
      .where(
        and(sql`${tickets.dateFermeture} IS NOT NULL`, gte(tickets.dateFermeture, fromDate)),
      )
      .groupBy(sql`to_char(${tickets.dateFermeture}, 'YYYY-MM')`);

    const moisSet = new Set<string>();
    createdRows.forEach((r) => moisSet.add(r.mois));
    resolvedRows.forEach((r) => moisSet.add(r.mois));
    closedRows.forEach((r) => moisSet.add(r.mois));

    const createdMap = Object.fromEntries(createdRows.map((r) => [r.mois, r.count]));
    const resolvedMap = Object.fromEntries(resolvedRows.map((r) => [r.mois, r.count]));
    const closedMap = Object.fromEntries(closedRows.map((r) => [r.mois, r.count]));

    return [...moisSet]
      .sort()
      .flatMap((mois) => [
        { mois, statut: 'CREES', count: createdMap[mois] ?? 0 },
        { mois, statut: 'RESOLUS', count: resolvedMap[mois] ?? 0 },
        { mois, statut: 'FERMES', count: closedMap[mois] ?? 0 },
      ]);
  }
}

export const dashboardRepository = new DashboardRepository();
