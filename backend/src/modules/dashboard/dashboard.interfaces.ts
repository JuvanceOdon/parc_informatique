import type {
  DashboardKpi,
  DashboardQuery,
  GroupCountRow,
  MonthlyTicketCountRow,
  MonthlyTypeCountRow,
} from './dashboard.types.js';

export interface IDashboardRepository {
  getKpi(): Promise<DashboardKpi>;
  getMaterielRepartitionByStatut(): Promise<GroupCountRow[]>;
  getMaterielRepartitionByEtat(): Promise<GroupCountRow[]>;
  getMaterielRepartitionByCategorie(): Promise<GroupCountRow[]>;
  getMaterielRepartitionByService(): Promise<GroupCountRow[]>;
  getTicketRepartitionByStatut(): Promise<GroupCountRow[]>;
  getTicketRepartitionByPriorite(): Promise<GroupCountRow[]>;
  getInterventionsMensuelles(months: number): Promise<MonthlyTypeCountRow[]>;
  getTicketsParMois(months: number): Promise<MonthlyTicketCountRow[]>;
}

export type { DashboardQuery };
