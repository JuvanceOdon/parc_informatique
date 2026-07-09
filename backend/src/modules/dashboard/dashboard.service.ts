import type { IDashboardRepository } from './dashboard.interfaces.js';
import type {
  ChartDataPoint,
  DashboardQuery,
  DashboardResponse,
  GroupCountRow,
  MonthlyInterventionPoint,
  MonthlyTicketPoint,
  MonthlyTicketCountRow,
  MonthlyTypeCountRow,
} from './dashboard.types.js';
import { dashboardRepository } from './dashboard.repository.js';

const MONTH_LABELS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
];

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

export class DashboardService {
  constructor(
    private readonly repository: IDashboardRepository = dashboardRepository,
  ) {}

  async getDashboard(query: DashboardQuery): Promise<DashboardResponse> {
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
      generatedAt: new Date(),
    };
  }

  async getKpi(): Promise<DashboardResponse['kpi']> {
    return this.repository.getKpi();
  }
}

export const dashboardService = new DashboardService();
