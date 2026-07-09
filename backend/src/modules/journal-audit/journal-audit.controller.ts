import type { Request, Response } from 'express';
import {
  asyncHandler,
  sendSuccess,
  buildPaginationMeta,
} from '../../utils/index.js';
import { AppError } from '../../shared/errors/index.js';
import {
  AuditAction,
  AuditCategorie,
} from '../../shared/constants/audit.constants.js';
import { auditLogger } from '../../utils/audit.logger.js';
import { journalAuditService } from './journal-audit.service.js';
import type {
  ExportJournalAuditQueryInput,
  ListJournalAuditQueryInput,
} from './journal-audit.validation.js';

export class JournalAuditController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListJournalAuditQueryInput;

    const { data, total } = await journalAuditService.list(
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      {
        action: query.action,
        categorie: query.categorie,
        utilisateurId: query.utilisateurId,
        dateDebut: query.dateDebut ? new Date(query.dateDebut) : undefined,
        dateFin: query.dateFin ? new Date(query.dateFin) : undefined,
        search: query.search,
      },
    );

    sendSuccess(
      res,
      data,
      'Journal d\'audit',
      200,
      buildPaginationMeta(query.page, query.limit, total),
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const entry = await journalAuditService.getById(id);
    sendSuccess(res, entry, 'Entrée du journal récupérée');
  });

  export = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();

    const query = req.query as unknown as ExportJournalAuditQueryInput;
    const result = await journalAuditService.export({
      format: query.format,
      action: query.action,
      categorie: query.categorie,
      utilisateurId: query.utilisateurId,
      dateDebut: query.dateDebut,
      dateFin: query.dateFin,
      search: query.search,
    });

    auditLogger.fromRequest(req, {
      utilisateurId: req.user.id,
      action: AuditAction.EXPORT,
      categorie: AuditCategorie.JOURNAL,
      description: `Export du journal d'audit (${query.format})`,
      metadonnees: {
        format: query.format,
        filters: {
          action: query.action,
          categorie: query.categorie,
          utilisateurId: query.utilisateurId,
        },
      },
    });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.buffer.length);
    res.send(result.buffer);
  });
}

export const journalAuditController = new JournalAuditController();
