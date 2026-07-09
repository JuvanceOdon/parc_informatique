import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/index.js';
import { AppError } from '../../shared/errors/index.js';
import { AuditAction, AuditCategorie } from '../../shared/constants/audit.constants.js';
import { auditLogger } from '../../utils/audit.logger.js';
import { RapportFormat } from './rapports.types.js';
import { rapportsService } from './rapports.service.js';
import type {
  RapportAnnuelQueryInput,
  RapportMensuelQueryInput,
} from './rapports.validation.js';

const sendRapport = (res: Response, result: Awaited<ReturnType<typeof rapportsService.genererMensuel>>): void => {
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `${result.disposition}; filename="${result.filename}"`);
  res.setHeader('Content-Length', result.buffer.length);
  res.status(200).end(result.buffer);
};

export class RapportsController {
  genererMensuel = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();

    const query = req.query as unknown as RapportMensuelQueryInput;
    const generatedBy = `${req.user.prenom} ${req.user.nom} (${req.user.matricule})`;

    const result = await rapportsService.genererMensuel(
      {
        annee: query.annee,
        mois: query.mois,
        format: query.format ?? RapportFormat.PDF,
        impression: query.impression ?? false,
      },
      generatedBy,
    );

    auditLogger.fromRequest(req, {
      utilisateurId: req.user.id,
      action: AuditAction.EXPORT,
      categorie: AuditCategorie.RAPPORT,
      description: `Export rapport mensuel ${query.mois}/${query.annee} (${query.format ?? RapportFormat.PDF})`,
      metadonnees: { type: 'MENSUEL', annee: query.annee, mois: query.mois, format: query.format },
    });

    sendRapport(res, result);
  });

  genererAnnuel = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();

    const query = req.query as unknown as RapportAnnuelQueryInput;
    const generatedBy = `${req.user.prenom} ${req.user.nom} (${req.user.matricule})`;

    const result = await rapportsService.genererAnnuel(
      {
        annee: query.annee,
        format: query.format ?? RapportFormat.PDF,
        impression: query.impression ?? false,
      },
      generatedBy,
    );

    auditLogger.fromRequest(req, {
      utilisateurId: req.user.id,
      action: AuditAction.EXPORT,
      categorie: AuditCategorie.RAPPORT,
      description: `Export rapport annuel ${query.annee} (${query.format ?? RapportFormat.PDF})`,
      metadonnees: { type: 'ANNUEL', annee: query.annee, format: query.format },
    });

    sendRapport(res, result);
  });
}

export const rapportsController = new RapportsController();
