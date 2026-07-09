import type { DashboardKpi } from '../dashboard/dashboard.types.js';

export enum RapportType {
  MENSUEL = 'MENSUEL',
  ANNUEL = 'ANNUEL',
}

export enum RapportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export interface RapportPeriode {
  type: RapportType;
  annee: number;
  mois?: number;
  label: string;
  dateDebut: Date;
  dateFin: Date;
}

export interface RapportActivite {
  ticketsCrees: number;
  ticketsResolus: number;
  ticketsFermes: number;
  maintenancesDemarrees: number;
  maintenancesTerminees: number;
  maintenancesPreventives: number;
  maintenancesCorrectives: number;
  affectationsCrees: number;
  affectationsTerminees: number;
}

export interface RapportTicketLigne {
  numeroTicket: string;
  titre: string;
  statut: string;
  priorite: string;
  dateCreation: Date;
}

export interface RapportMaintenanceLigne {
  numeroMaintenance: string;
  titre: string;
  type: string;
  statut: string;
  materielCode: string;
  dateDebut: Date | null;
  dateFin: Date | null;
}

export interface RapportData {
  periode: RapportPeriode;
  kpi: DashboardKpi;
  activite: RapportActivite;
  tickets: RapportTicketLigne[];
  maintenances: RapportMaintenanceLigne[];
  generatedAt: Date;
  generatedBy: string;
}

export interface RapportGenere {
  buffer: Buffer;
  filename: string;
  contentType: string;
  disposition: 'attachment' | 'inline';
}

export interface RapportMensuelQuery {
  annee: number;
  mois: number;
  format: RapportFormat;
  impression: boolean;
}

export interface RapportAnnuelQuery {
  annee: number;
  format: RapportFormat;
  impression: boolean;
}
