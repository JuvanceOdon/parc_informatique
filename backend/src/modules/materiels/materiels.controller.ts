import type { Request, Response } from 'express';
import {
  asyncHandler,
  sendCreated,
  sendSuccess,
  buildPaginationMeta,
} from '../../utils/index.js';
import { AppError } from '../../shared/errors/index.js';
import { materielsService } from './materiels.service.js';
import type { ListMaterielsQueryInput } from './materiels.validation.js';

export class MaterielsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListMaterielsQueryInput;

    const { data, total } = await materielsService.list(
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      {
        search: query.search,
        categorieId: query.categorieId,
        serviceId: query.serviceId,
        statut: query.statut,
        etat: query.etat,
        actif: query.actif,
        garantieExpiree: query.garantieExpiree,
        garantieExpireBientot: query.garantieExpireBientot,
      },
    );

    sendSuccess(
      res,
      data,
      'Liste des matériels',
      200,
      buildPaginationMeta(query.page, query.limit, total),
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const materiel = await materielsService.getById(id);
    sendSuccess(res, materiel, 'Matériel récupéré');
  });

  getByCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params as { code: string };
    const materiel = await materielsService.getByCode(code);
    sendSuccess(res, materiel, 'Matériel récupéré');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const materiel = await materielsService.create(req.body, req.user.id);
    sendCreated(res, materiel, 'Matériel créé avec succès');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const materiel = await materielsService.update(id, req.body, req.user.id);
    sendSuccess(res, materiel, 'Matériel mis à jour avec succès');
  });

  deactivate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const materiel = await materielsService.deactivate(id, req.user.id);
    sendSuccess(res, materiel, 'Matériel désactivé avec succès');
  });

  getHistorique = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const historique = await materielsService.getHistorique(id);
    sendSuccess(res, historique, 'Historique du matériel');
  });

  getQrCode = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const qrCode = await materielsService.getQrCode(id);
    sendSuccess(res, qrCode, 'QR Code généré');
  });

  uploadImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    if (!req.file) throw AppError.badRequest('Aucun fichier image fourni');

    const id = Number(req.params.id);
    const isPrincipal = req.body.isPrincipal === 'true' || req.body.isPrincipal === true;

    const materiel = await materielsService.addImage(
      id,
      req.file,
      req.user.id,
      isPrincipal,
    );
    sendSuccess(res, materiel, 'Image ajoutée avec succès');
  });

  deleteImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const materielId = Number(req.params.id);
    const imageId = Number(req.params.imageId);
    const materiel = await materielsService.deleteImage(materielId, imageId, req.user.id);
    sendSuccess(res, materiel, 'Image supprimée avec succès');
  });
}

export const materielsController = new MaterielsController();
