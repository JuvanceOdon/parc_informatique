import type { Request, Response } from 'express';
import {
  asyncHandler,
  sendCreated,
  sendSuccess,
  buildPaginationMeta,
} from '../../utils/index.js';
import { AppError } from '../../shared/errors/index.js';
import { maintenancesService } from './maintenances.service.js';
import type { ListMaintenancesQueryInput } from './maintenances.validation.js';

export class MaintenancesController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListMaintenancesQueryInput;

    const { data, total } = await maintenancesService.list(
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      {
        materielId: query.materielId,
        ticketId: query.ticketId,
        technicienId: query.technicienId,
        type: query.type,
        statut: query.statut,
        activeOnly: query.activeOnly,
        search: query.search,
      },
    );

    sendSuccess(
      res,
      data,
      'Liste des maintenances',
      200,
      buildPaginationMeta(query.page, query.limit, total),
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const maintenance = await maintenancesService.getById(id);
    sendSuccess(res, maintenance, 'Maintenance récupérée');
  });

  getActiveByMateriel = asyncHandler(async (req: Request, res: Response) => {
    const materielId = Number(req.params.materielId);
    const maintenance = await maintenancesService.getActiveByMaterielId(materielId);

    if (!maintenance) {
      sendSuccess(res, null, 'Aucune maintenance active pour ce matériel');
      return;
    }

    sendSuccess(res, maintenance, 'Maintenance active récupérée');
  });

  getHistoriqueByMateriel = asyncHandler(async (req: Request, res: Response) => {
    const materielId = Number(req.params.materielId);
    const historique = await maintenancesService.getHistoriqueByMaterielId(materielId);
    sendSuccess(res, historique, 'Historique des maintenances du matériel');
  });

  getHistorique = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const historique = await maintenancesService.getHistorique(id);
    sendSuccess(res, historique, 'Historique de la maintenance');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const maintenance = await maintenancesService.create(req.body, req.user.id);
    sendCreated(res, maintenance, 'Maintenance créée avec succès');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const maintenance = await maintenancesService.update(id, req.body, req.user.id);
    sendSuccess(res, maintenance, 'Maintenance mise à jour');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    await maintenancesService.delete(id);
    sendSuccess(res, null, 'Maintenance supprimée');
  });

  demarrer = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const maintenance = await maintenancesService.demarrer(id, req.user.id);
    sendSuccess(res, maintenance, 'Maintenance démarrée');
  });

  enregistrerDiagnostic = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const maintenance = await maintenancesService.enregistrerDiagnostic(
      id,
      req.body,
      req.user.id,
    );
    sendSuccess(res, maintenance, 'Diagnostic enregistré');
  });

  enregistrerSolution = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const maintenance = await maintenancesService.enregistrerSolution(
      id,
      req.body,
      req.user.id,
    );
    sendSuccess(res, maintenance, 'Solution enregistrée — maintenance terminée');
  });

  annuler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const maintenance = await maintenancesService.annuler(id, req.body, req.user.id);
    sendSuccess(res, maintenance, 'Maintenance annulée');
  });

  reprendre = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const maintenance = await maintenancesService.reprendre(id, req.user.id);
    sendSuccess(res, maintenance, 'Intervention reprise');
  });
}

export const maintenancesController = new MaintenancesController();
