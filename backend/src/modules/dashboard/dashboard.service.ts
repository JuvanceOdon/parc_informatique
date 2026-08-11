import type { AuthenticatedUser } from '../auth/auth.types.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { TicketPriorite } from '../../shared/constants/ticket.constants.js';
import { MaintenanceStatut } from '../../shared/constants/maintenance.constants.js';
import {
  getTicketSlaHoursOverdue,
  isTicketSlaBreached,
  TICKET_SLA_HEURES,
  TICKET_SLA_REGLES,
} from '../../shared/constants/sla.constants.js';
import type { IDashboardRepository } from './dashboard.interfaces.js';
import type {
  ActiveMaintenanceRow,
  ChartDataPoint,
  DashboardPilotage,
  DashboardQuery,
  DashboardResponse,
  GroupCountRow,
  MonthlyInterventionPoint,
  MonthlyTicketPoint,
  MonthlyTicketCountRow,
  MonthlyTypeCountRow,
  OpenTicketRow,
  PilotageGarantieItem,
  PilotageMaintenanceItem,
  PilotageTicketItem,
} from './dashboard.types.js';
import { dashboardRepository } from './dashboard.repository.js';

const MONTH_LABELS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
];

const LIST_LIMIT = 8;
const MAINTENANCE_PROLONGEE_JOURS = 7;

const buildMonthLabels = (months: number): { mois: string; label: string }[] => {
  const result: { mois: string; label: string }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const mois = `${year}-${String(month + 1).padStart(2, '0')}`;
    result.push({ mois, label: `${MONTH_LABELS[month]} ${year}` });
  }

  return result;
};

const toChartData = (rows: GroupCountRow[]): ChartDataPoint[] =>
  rows.map((row) => ({
    label: row.label,
    value: row.count,
    ...(row.code ? { code: row.code } : {}),
    ...(row.id !== undefined ? { id: row.id } : {}),
  }));

const buildInterventionsMensuelles = (
  rows: MonthlyTypeCountRow[],
  months: number,
): MonthlyInterventionPoint[] => {
  const monthLabels = buildMonthLabels(months);
  const dataMap = new Map<string, { preventive: number; corrective: number }>();

  for (const row of rows) {
    const entry = dataMap.get(row.mois) ?? { preventive: 0, corrective: 0 };
    if (row.type === 'PREVENTIVE') entry.preventive = row.count;
    if (row.type === 'CORRECTIVE') entry.corrective = row.count;
    dataMap.set(row.mois, entry);
  }

  return monthLabels.map(({ mois, label }) => {
    const data = dataMap.get(mois) ?? { preventive: 0, corrective: 0 };
    return {
      mois,
      label,
      preventive: data.preventive,
      corrective: data.corrective,
      total: data.preventive + data.corrective,
    };
  });
};

const buildTicketsParMois = (
  rows: MonthlyTicketCountRow[],
  months: number,
): MonthlyTicketPoint[] => {
  const monthLabels = buildMonthLabels(months);
  const dataMap = new Map<string, { crees: number; resolus: number; fermes: number }>();

  for (const row of rows) {
    const entry = dataMap.get(row.mois) ?? { crees: 0, resolus: 0, fermes: 0 };
    if (row.statut === 'CREES') entry.crees = row.count;
    if (row.statut === 'RESOLUS') entry.resolus = row.count;
    if (row.statut === 'FERMES') entry.fermes = row.count;
    dataMap.set(row.mois, entry);
  }

  return monthLabels.map(({ mois, label }) => {
    const data = dataMap.get(mois) ?? { crees: 0, resolus: 0, fermes: 0 };
    return { mois, label, ...data };
  });
};

const toPilotageTicket = (row: OpenTicketRow, now = new Date()): PilotageTicketItem => {
  const priorite = row.priorite as TicketPriorite;
  const slaHeures = TICKET_SLA_HEURES[priorite] ?? TICKET_SLA_HEURES[TicketPriorite.MOYENNE];
  const slaDepasse = isTicketSlaBreached(row.createdAt, row.priorite, now);
  return {
    id: row.id,
    numeroTicket: row.numeroTicket,
    titre: row.titre,
    priorite: row.priorite,
    statut: row.statut,
    createdAt: row.createdAt,
    assigneeId: row.assigneeId,
    demandeurId: row.demandeurId,
    slaHeures,
    slaDepasse,
    heuresDepassement: getTicketSlaHoursOverdue(row.createdAt, row.priorite, now),
  };
};

const getMaintenanceMotifRetard = (
  row: ActiveMaintenanceRow,
  now: Date,
): PilotageMaintenanceItem['motifRetard'] => {
  if (
    row.statut === MaintenanceStatut.PLANIFIEE &&
    row.datePlanifiee &&
    row.datePlanifiee.getTime() < now.getTime()
  ) {
    return 'PLANIFIEE_DEPASSEE';
  }

  if (
    (row.statut === MaintenanceStatut.EN_COURS || row.statut === MaintenanceStatut.DIAGNOSTIC) &&
    row.dateDebut
  ) {
    const limit = new Date(row.dateDebut);
    limit.setDate(limit.getDate() + MAINTENANCE_PROLONGEE_JOURS);
    if (limit.getTime() < now.getTime()) return 'INTERVENTION_PROLONGEE';
  }

  return null;
};

const toPilotageMaintenance = (
  row: ActiveMaintenanceRow,
  now = new Date(),
): PilotageMaintenanceItem => ({
  id: row.id,
  numeroMaintenance: row.numeroMaintenance,
  titre: row.titre,
  type: row.type,
  statut: row.statut,
  datePlanifiee: row.datePlanifiee,
  dateDebut: row.dateDebut,
  technicienId: row.technicienId,
  materielId: row.materielId,
  motifRetard: getMaintenanceMotifRetard(row, now),
});

const daysUntil = (dateStr: string, now: Date): number => {
  const end = new Date(`${dateStr}T23:59:59`);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
};

const buildPilotage = (
  openTickets: OpenTicketRow[],
  activeMaintenances: ActiveMaintenanceRow[],
  garanties: { id: number; codeMateriel: string; designation: string; dateFinGarantie: string }[],
  user: AuthenticatedUser,
): DashboardPilotage => {
  const now = new Date();
  const isStaff = user.role.code !== RoleCode.UTILISATEUR;

  const ticketItems = openTickets.map((t) => toPilotageTicket(t, now));
  const scopeTickets = isStaff
    ? ticketItems
    : ticketItems.filter((t) => t.demandeurId === user.id);

  const ticketsUrgents = scopeTickets
    .filter((t) => t.priorite === TicketPriorite.CRITIQUE || t.priorite === TicketPriorite.HAUTE)
    .slice(0, LIST_LIMIT);

  const ticketsSlaDepasses = scopeTickets
    .filter((t) => t.slaDepasse)
    .sort((a, b) => b.heuresDepassement - a.heuresDepassement)
    .slice(0, LIST_LIMIT);

  const maintenanceItems = activeMaintenances.map((m) => toPilotageMaintenance(m, now));
  const maintenancesEnRetard = isStaff
    ? maintenanceItems.filter((m) => m.motifRetard !== null).slice(0, LIST_LIMIT)
    : [];

  const garantiesExpirant: PilotageGarantieItem[] = isStaff
    ? garanties.map((g) => ({
        id: g.id,
        codeMateriel: g.codeMateriel,
        designation: g.designation,
        dateFinGarantie: g.dateFinGarantie,
        joursRestants: daysUntil(g.dateFinGarantie, now),
      }))
    : [];

  const maChargeTickets = isStaff
    ? ticketItems.filter((t) => t.assigneeId === user.id).slice(0, LIST_LIMIT)
    : ticketItems.filter((t) => t.demandeurId === user.id).slice(0, LIST_LIMIT);

  const maChargeMaintenances = isStaff
    ? maintenanceItems.filter((m) => m.technicienId === user.id).slice(0, LIST_LIMIT)
    : [];

  const ouverts = scopeTickets.length;
  const depasses = scopeTickets.filter((t) => t.slaDepasse).length;
  const dansLesDelais = ouverts - depasses;

  return {
    aTraiter: {
      ticketsUrgents,
      ticketsSlaDepasses,
      maintenancesEnRetard,
      garantiesExpirant,
    },
    maCharge: {
      tickets: maChargeTickets,
      maintenances: maChargeMaintenances,
    },
    sla: {
      ticketsOuverts: ouverts,
      ticketsDansLesDelais: dansLesDelais,
      ticketsSlaDepasses: depasses,
      tauxRespectSla: ouverts > 0 ? Math.round((dansLesDelais / ouverts) * 1000) / 10 : 100,
      regles: TICKET_SLA_REGLES,
    },
  };
};

export class DashboardService {
  constructor(
    private readonly repository: IDashboardRepository = dashboardRepository,
  ) {}

  async getDashboard(
    query: DashboardQuery,
    user: AuthenticatedUser,
  ): Promise<DashboardResponse> {
    const [
      kpi,
      parStatut,
      parEtat,
      parCategorie,
      parService,
      ticketsParStatut,
      ticketsParPriorite,
      interventionsRows,
      ticketsRows,
      openTickets,
      activeMaintenances,
      garanties,
    ] = await Promise.all([
      this.repository.getKpi(),
      this.repository.getMaterielRepartitionByStatut(),
      this.repository.getMaterielRepartitionByEtat(),
      this.repository.getMaterielRepartitionByCategorie(),
      this.repository.getMaterielRepartitionByService(),
      this.repository.getTicketRepartitionByStatut(),
      this.repository.getTicketRepartitionByPriorite(),
      this.repository.getInterventionsMensuelles(query.months),
      this.repository.getTicketsParMois(query.months),
      this.repository.getOpenTickets(),
      this.repository.getActiveMaintenances(),
      this.repository.getGarantiesExpirant(30),
    ]);

    const interventionsMensuelles = buildInterventionsMensuelles(
      interventionsRows,
      query.months,
    );
    const ticketsParMois = buildTicketsParMois(ticketsRows, query.months);

    return {
      kpi,
      repartitionMateriels: {
        parStatut: toChartData(parStatut),
        parEtat: toChartData(parEtat),
        parCategorie: toChartData(parCategorie),
        parService: toChartData(parService),
      },
      repartitionTickets: {
        parStatut: toChartData(ticketsParStatut),
        parPriorite: toChartData(ticketsParPriorite),
      },
      interventionsMensuelles,
      graphiques: {
        ticketsParMois,
        maintenancesParMois: interventionsMensuelles,
      },
      pilotage: buildPilotage(openTickets, activeMaintenances, garanties, user),
      generatedAt: new Date(),
    };
  }

  async getKpi(): Promise<DashboardResponse['kpi']> {
    return this.repository.getKpi();
  }
}

export const dashboardService = new DashboardService();
