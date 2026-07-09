import type { Request, Response } from 'express';
import {
  asyncHandler,
  sendCreated,
  sendSuccess,
  buildPaginationMeta,
} from '../../utils/index.js';
import { AppError } from '../../shared/errors/index.js';
import { affectationsService } from './affectations.service.js';
import type { ListAffectationsQueryInput } from './affectations.validation.js';

export class AffectationsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListAffectationsQueryInput;

    const { data, total } = await affectationsService.list(
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      {
        materielId: query.materielId,
        utilisateurId: query.utilisateurId,
        serviceId: query.serviceId,
        statut: query.statut,
        activeOnly: query.activeOnly,
        search: query.search,
      },
    );

    sendSuccess(
      res,
      data,
      'Liste des affectations',
      200,
      buildPaginationMeta(query.page, query.limit, total),
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const affectation = await affectationsService.getById(id);
    sendSuccess(res, affectation, 'Affectation récupérée');
  });

  getActiveByMateriel = asyncHandler(async (req: Request, res: Response) => {
    const materielId = Number(req.params.materielId);
    const affectation = await affectationsService.getActiveByMaterielId(materielId);

    if (!affectation) {
      sendSuccess(res, null, 'Aucune affectation active pour ce matériel');
      return;
    }

    sendSuccess(res, affectation, 'Affectation active récupérée');
  });

  getHistoriqueByMateriel = asyncHandler(async (req: Request, res: Response) => {
    const materielId = Number(req.params.materielId);
    const historique = await affectationsService.getHistoriqueByMaterielId(materielId);
    sendSuccess(res, historique, 'Historique des affectations du matériel');
  });

  getByUtilisateur = asyncHandler(async (req: Request, res: Response) => {
    const utilisateurId = Number(req.params.utilisateurId);
    const affectations = await affectationsService.getByUtilisateurId(utilisateurId);
    sendSuccess(res, affectations, 'Affectations de l\'utilisateur');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const affectation = await affectationsService.create(req.body, req.user.id);
    sendCreated(res, affectation, 'Matériel affecté avec succès');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const affectation = await affectationsService.update(id, req.body, req.user.id);
    sendSuccess(res, affectation, 'Affectation mise à jour');
  });

  transfer = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const affectation = await affectationsService.transfer(id, req.body, req.user.id);
    sendSuccess(res, affectation, 'Transfert effectué avec succès');
  });

  terminer = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const affectation = await affectationsService.terminer(id, req.body, req.user.id);
    sendSuccess(res, affectation, 'Affectation terminée — matériel restitué');
  });
}

export const affectationsController = new AffectationsController();
