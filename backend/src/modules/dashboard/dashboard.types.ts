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

export interface PilotageTicketItem {
  id: number;
  numeroTicket: string;
  titre: string;
  priorite: string;
  statut: string;
  createdAt: Date;
  assigneeId: number | null;
  demandeurId: number;
  slaHeures: number;
  slaDepasse: boolean;
  heuresDepassement: number;
}

export interface PilotageMaintenanceItem {
  id: number;
  numeroMaintenance: string;
  titre: string;
  type: string;
  statut: string;
  datePlanifiee: Date | null;
  dateDebut: Date | null;
  technicienId: number | null;
  materielId: number;
  motifRetard: 'PLANIFIEE_DEPASSEE' | 'INTERVENTION_PROLONGEE' | null;
}

export interface PilotageGarantieItem {
  id: number;
  codeMateriel: string;
  designation: string;
  dateFinGarantie: string;
  joursRestants: number;
}

export interface SlaRegle {
  priorite: string;
  delaiHeures: number;
}

export interface DashboardSlaSummary {
  ticketsOuverts: number;
  ticketsDansLesDelais: number;
  ticketsSlaDepasses: number;
  tauxRespectSla: number;
  regles: SlaRegle[];
}

export interface DashboardPilotage {
  aTraiter: {
    ticketsUrgents: PilotageTicketItem[];
    ticketsSlaDepasses: PilotageTicketItem[];
    maintenancesEnRetard: PilotageMaintenanceItem[];
    garantiesExpirant: PilotageGarantieItem[];
  };
  maCharge: {
    tickets: PilotageTicketItem[];
    maintenances: PilotageMaintenanceItem[];
  };
  sla: DashboardSlaSummary;
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
  pilotage: DashboardPilotage;
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

export interface OpenTicketRow {
  id: number;
  numeroTicket: string;
  titre: string;
  priorite: string;
  statut: string;
  createdAt: Date;
  assigneeId: number | null;
  demandeurId: number;
}

export interface ActiveMaintenanceRow {
  id: number;
  numeroMaintenance: string;
  titre: string;
  type: string;
  statut: string;
  datePlanifiee: Date | null;
  dateDebut: Date | null;
  technicienId: number | null;
  materielId: number;
}

export interface GarantieRow {
  id: number;
  codeMateriel: string;
  designation: string;
  dateFinGarantie: string;
}
