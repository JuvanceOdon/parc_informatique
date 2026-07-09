export interface ChartDataPoint {
  label: string;
  value: number;
  code?: string;
  id?: number;
}

export interface MonthlyInterventionPoint {
  mois: string;
  label: string;
  preventive: number;
  corrective: number;
  total: number;
}

export interface MonthlyTicketPoint {
  mois: string;
  label: string;
  crees: number;
  resolus: number;
  fermes: number;
}

export interface DashboardKpi {
  totalMateriels: number;
  materielsActifs: number;
  materielsEnService: number;
  materielsEnStock: number;
  materielsEnMaintenance: number;
  materielsHorsService: number;
  tauxDisponibilite: number;
  ticketsTotal: number;
  ticketsOuverts: number;
  ticketsEnCours: number;
  ticketsResolus: number;
  maintenancesEnCours: number;
  maintenancesTermineesMois: number;
  affectationsActives: number;
  utilisateursActifs: number;
  garantiesExpirant30Jours: number;
}

export interface DashboardResponse {
  kpi: DashboardKpi;
  repartitionMateriels: {
    parStatut: ChartDataPoint[];
    parEtat: ChartDataPoint[];
    parCategorie: ChartDataPoint[];
    parService: ChartDataPoint[];
  };
  repartitionTickets: {
    parStatut: ChartDataPoint[];
    parPriorite: ChartDataPoint[];
  };
  interventionsMensuelles: MonthlyInterventionPoint[];
  graphiques: {
    ticketsParMois: MonthlyTicketPoint[];
    maintenancesParMois: MonthlyInterventionPoint[];
  };
  generatedAt: Date;
}

export interface DashboardQuery {
  months: number;
}

export interface GroupCountRow {
  key: string;
  label: string;
  count: number;
  id?: number;
  code?: string;
}

export interface MonthlyTypeCountRow {
  mois: string;
  type: string;
  count: number;
}

export interface MonthlyTicketCountRow {
  mois: string;
  statut: string;
  count: number;
}
