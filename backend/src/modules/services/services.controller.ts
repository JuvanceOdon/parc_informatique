import type { Request, Response } from 'express';
import { asyncHandler, sendCreated, sendSuccess, buildPaginationMeta } from '../../utils/index.js';
import { servicesService } from './services.service.js';
import type { ListServicesQueryInput } from './services.validation.js';

export class ServicesController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListServicesQueryInput;

    const { data, total } = await servicesService.list(
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        search: query.search,
        actif: query.actif,
      },
      {
        search: query.search,
        actif: query.actif,
      },
    );

    sendSuccess(
      res,
      data,
      'Liste des services',
      200,
      buildPaginationMeta(query.page, query.limit, total),
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const service = await servicesService.getById(id);
    sendSuccess(res, service, 'Service récupéré');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const service = await servicesService.create(req.body);
    sendCreated(res, service, 'Service créé avec succès');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const service = await servicesService.update(id, req.body);
    sendSuccess(res, service, 'Service mis à jour avec succès');
  });

  deactivate = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const service = await servicesService.deactivate(id);
    sendSuccess(res, service, 'Service désactivé avec succès');
  });

  activate = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const service = await servicesService.activate(id);
    sendSuccess(res, service, 'Service activé avec succès');
  });

  assignResponsable = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { responsableId } = req.body as { responsableId: number };
    const service = await servicesService.assignResponsable(id, responsableId);
    sendSuccess(res, service, 'Responsable affecté avec succès');
  });

  removeResponsable = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const service = await servicesService.removeResponsable(id);
    sendSuccess(res, service, 'Responsable retiré avec succès');
  });
}

export const servicesController = new ServicesController();
