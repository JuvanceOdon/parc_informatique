import ExcelJS from 'exceljs';
import {
  AUDIT_ACTION_LABELS,
  AUDIT_CATEGORIE_LABELS,
  AuditExportFormat,
} from '../../shared/constants/audit.constants.js';
import type { AuditAction, AuditCategorie } from '../../shared/constants/audit.constants.js';
import { AppError } from '../../shared/errors/index.js';
import { journalAuditRepository } from './journal-audit.repository.js';
import type {
  JournalAuditExportQuery,
  JournalAuditExportResult,
  JournalAuditFilters,
  JournalAuditListQuery,
  JournalAuditResponse,
  JournalAuditRow,
} from './journal-audit.types.js';

const escapeCsv = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const formatDateTime = (date: Date): string =>
  date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' });

export class JournalAuditService {
  async list(
    query: JournalAuditListQuery,
    filters: JournalAuditFilters,
  ): Promise<{ data: JournalAuditResponse[]; total: number }> {
    const { rows, total } = await journalAuditRepository.findAll(query, filters);
    return { data: rows.map((row) => this.mapToResponse(row)), total };
  }

  async getById(id: number): Promise<JournalAuditResponse> {
    const entry = await journalAuditRepository.findById(id);
    if (!entry) throw AppError.notFound('Entrée du journal introuvable');
    return this.mapToResponse(entry);
  }

  async export(query: JournalAuditExportQuery): Promise<JournalAuditExportResult> {
    const filters: JournalAuditFilters = {
      action: query.action,
      categorie: query.categorie,
      utilisateurId: query.utilisateurId,
      dateDebut: query.dateDebut ? new Date(query.dateDebut) : undefined,
      dateFin: query.dateFin ? new Date(query.dateFin) : undefined,
      search: query.search,
    };

    const rows = await journalAuditRepository.findAllForExport(filters);

    if (query.format === AuditExportFormat.EXCEL) {
      return this.exportExcel(rows);
    }

    return this.exportCsv(rows);
  }

  private exportCsv(rows: JournalAuditRow[]): JournalAuditExportResult {
    const header = 'Date,Utilisateur,Matricule,Action,Catégorie,Description,IP,Entité';
    const lines = rows.map((row) => {
      const utilisateur = row.utilisateurId
        ? `${row.utilisateurPrenom} ${row.utilisateurNom}`
        : 'Système';
      return [
        escapeCsv(formatDateTime(row.createdAt)),
        escapeCsv(utilisateur),
        escapeCsv(row.utilisateurMatricule ?? ''),
        escapeCsv(AUDIT_ACTION_LABELS[row.action as AuditAction] ?? row.action),
        escapeCsv(AUDIT_CATEGORIE_LABELS[row.categorie as AuditCategorie] ?? row.categorie),
        escapeCsv(row.description),
        escapeCsv(row.ipAddress ?? ''),
        escapeCsv(row.entiteType ? `${row.entiteType}#${row.entiteId ?? ''}` : ''),
      ].join(',');
    });

    const buffer = Buffer.from(`\uFEFF${header}\n${lines.join('\n')}`, 'utf-8');
    const timestamp = new Date().toISOString().slice(0, 10);

    return {
      buffer,
      filename: `journal-audit-${timestamp}.csv`,
      contentType: 'text/csv; charset=utf-8',
    };
  }

  private async exportExcel(rows: JournalAuditRow[]): Promise<JournalAuditExportResult> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Journal audit');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Utilisateur', key: 'utilisateur', width: 25 },
      { header: 'Matricule', key: 'matricule', width: 15 },
      { header: 'Action', key: 'action', width: 15 },
      { header: 'Catégorie', key: 'categorie', width: 18 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'IP', key: 'ip', width: 16 },
      { header: 'Entité', key: 'entite', width: 20 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const row of rows) {
      sheet.addRow({
        date: formatDateTime(row.createdAt),
        utilisateur: row.utilisateurId
          ? `${row.utilisateurPrenom} ${row.utilisateurNom}`
          : 'Système',
        matricule: row.utilisateurMatricule ?? '',
        action: AUDIT_ACTION_LABELS[row.action as AuditAction] ?? row.action,
        categorie: AUDIT_CATEGORIE_LABELS[row.categorie as AuditCategorie] ?? row.categorie,
        description: row.description,
        ip: row.ipAddress ?? '',
        entite: row.entiteType ? `${row.entiteType}#${row.entiteId ?? ''}` : '',
      });
    }

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const timestamp = new Date().toISOString().slice(0, 10);

    return {
      buffer,
      filename: `journal-audit-${timestamp}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private mapToResponse(row: JournalAuditRow): JournalAuditResponse {
    return {
      id: row.id,
      utilisateur: row.utilisateurId
        ? {
            id: row.utilisateurId,
            matricule: row.utilisateurMatricule!,
            nom: row.utilisateurNom!,
            prenom: row.utilisateurPrenom!,
            email: row.utilisateurEmail!,
          }
        : null,
      action: row.action as AuditAction,
      categorie: row.categorie as AuditCategorie,
      description: row.description,
      entiteType: row.entiteType,
      entiteId: row.entiteId,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      metadonnees: row.metadonnees as Record<string, unknown> | null,
      createdAt: row.createdAt,
    };
  }
}

export const journalAuditService = new JournalAuditService();
