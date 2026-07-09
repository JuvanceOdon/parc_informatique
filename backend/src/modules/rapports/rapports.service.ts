import { AppError } from '../../shared/errors/index.js';
import { dashboardRepository } from '../dashboard/dashboard.repository.js';
import { generateRapportExcel } from './rapports.excel.generator.js';
import { generateRapportPdf } from './rapports.pdf.generator.js';
import { buildAnnuelPeriode, buildMensuelPeriode } from './rapports.period.util.js';
import { rapportsRepository } from './rapports.repository.js';
import {
  RapportFormat,
  type RapportAnnuelQuery,
  type RapportData,
  type RapportGenere,
  type RapportMensuelQuery,
} from './rapports.types.js';

export class RapportsService {
  async genererMensuel(
    query: RapportMensuelQuery,
    generatedBy: string,
  ): Promise<RapportGenere> {
    const periode = buildMensuelPeriode(query.annee, query.mois);
    const data = await this.buildRapportData(periode, generatedBy);
    return this.buildOutput(data, query.format, query.impression, 'mensuel', query.annee, query.mois);
  }

  async genererAnnuel(query: RapportAnnuelQuery, generatedBy: string): Promise<RapportGenere> {
    const periode = buildAnnuelPeriode(query.annee);
    const data = await this.buildRapportData(periode, generatedBy);
    return this.buildOutput(data, query.format, query.impression, 'annuel', query.annee);
  }

  private async buildRapportData(
    periode: RapportData['periode'],
    generatedBy: string,
  ): Promise<RapportData> {
    const [kpi, activite, tickets, maintenances] = await Promise.all([
      dashboardRepository.getKpi(),
      rapportsRepository.getActivitePeriode(periode.dateDebut, periode.dateFin),
      rapportsRepository.getTicketsPeriode(periode.dateDebut, periode.dateFin),
      rapportsRepository.getMaintenancesPeriode(periode.dateDebut, periode.dateFin),
    ]);

    return {
      periode,
      kpi,
      activite,
      tickets,
      maintenances,
      generatedAt: new Date(),
      generatedBy,
    };
  }

  private async buildOutput(
    data: RapportData,
    format: RapportFormat,
    impression: boolean,
    type: 'mensuel' | 'annuel',
    annee: number,
    mois?: number,
  ): Promise<RapportGenere> {
    const suffix = type === 'mensuel' ? `${annee}-${String(mois).padStart(2, '0')}` : `${annee}`;

    if (format === RapportFormat.PDF) {
      const buffer = await generateRapportPdf(data);
      return {
        buffer,
        filename: `rapport-${type}-${suffix}.pdf`,
        contentType: 'application/pdf',
        disposition: impression ? 'inline' : 'attachment',
      };
    }

    if (format === RapportFormat.EXCEL) {
      if (impression) {
        throw AppError.badRequest('L\'impression directe n\'est disponible qu\'en format PDF');
      }
      const buffer = await generateRapportExcel(data);
      return {
        buffer,
        filename: `rapport-${type}-${suffix}.xlsx`,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: 'attachment',
      };
    }

    throw AppError.badRequest('Format de rapport non supporté');
  }
}

export const rapportsService = new RapportsService();
