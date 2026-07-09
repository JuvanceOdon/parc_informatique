import type { Request, Response } from 'express';
import {
  asyncHandler,
  sendCreated,
  sendSuccess,
  sendNoContent,
  buildPaginationMeta,
} from '../../utils/index.js';
import { AuditAction, AuditCategorie } from '../../shared/constants/audit.constants.js';
import { auditLogger } from '../../utils/audit.logger.js';
import { categoriesService } from './categories.service.js';
import type { ListCategoriesQueryInput } from './categories.validation.js';

export class CategoriesController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListCategoriesQueryInput;

    const { data, total } = await categoriesService.list(
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
      'Liste des catégories',
      200,
      buildPaginationMeta(query.page, query.limit, total),
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const categorie = await categoriesService.getById(id);
    sendSuccess(res, categorie, 'Catégorie récupérée');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const categorie = await categoriesService.create(req.body);

    auditLogger.fromRequest(req, {
      action: AuditAction.CREATION,
      categorie: AuditCategorie.CATEGORIE,
      description: `Création catégorie ${categorie.code}`,
      entiteType: 'CATEGORIE',
      entiteId: categorie.id,
    });

    sendCreated(res, categorie, 'Catégorie créée avec succès');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const categorie = await categoriesService.update(id, req.body);

    auditLogger.fromRequest(req, {
      action: AuditAction.MODIFICATION,
      categorie: AuditCategorie.CATEGORIE,
      description: `Modification catégorie ${categorie.code}`,
      entiteType: 'CATEGORIE',
      entiteId: categorie.id,
    });

    sendSuccess(res, categorie, 'Catégorie mise à jour avec succès');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const existing = await categoriesService.getById(id);
    await categoriesService.delete(id);

    auditLogger.fromRequest(req, {
      action: AuditAction.SUPPRESSION,
      categorie: AuditCategorie.CATEGORIE,
      description: `Suppression catégorie ${existing.code}`,
      entiteType: 'CATEGORIE',
      entiteId: id,
    });

    sendNoContent(res);
  });
}

export const categoriesController = new CategoriesController();
