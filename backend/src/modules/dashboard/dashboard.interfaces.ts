import type {
  DashboardKpi,
  DashboardQuery,
  GroupCountRow,
  MonthlyTicketCountRow,
  MonthlyTypeCountRow,
  OpenTicketRow,
  ActiveMaintenanceRow,
  GarantieRow,
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
  getOpenTickets(): Promise<OpenTicketRow[]>;
  getActiveMaintenances(): Promise<ActiveMaintenanceRow[]>;
  getGarantiesExpirant(days?: number): Promise<GarantieRow[]>;
}

export type { DashboardQuery };
