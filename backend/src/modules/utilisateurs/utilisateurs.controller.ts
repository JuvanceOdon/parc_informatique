import type { Request, Response } from 'express';
import { asyncHandler, sendCreated, sendSuccess, buildPaginationMeta } from '../../utils/index.js';
import { AppError } from '../../shared/errors/index.js';
import { AuditAction, AuditCategorie } from '../../shared/constants/audit.constants.js';
import { auditLogger } from '../../utils/audit.logger.js';
import { utilisateursService } from './utilisateurs.service.js';
import type { ListUtilisateursQueryInput } from './utilisateurs.validation.js';

export class UtilisateursController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListUtilisateursQueryInput;

    const { data, total } = await utilisateursService.list(
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        search: query.search,
        actif: query.actif,
        roleId: query.roleId,
      },
      {
        search: query.search,
        actif: query.actif,
        roleId: query.roleId,
      },
    );

    sendSuccess(
      res,
      data,
      'Liste des utilisateurs',
      200,
      buildPaginationMeta(query.page, query.limit, total),
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = await utilisateursService.getById(id);
    sendSuccess(res, user, 'Utilisateur récupéré');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = await utilisateursService.create(req.body);

    auditLogger.fromRequest(req, {
      action: AuditAction.CREATION,
      categorie: AuditCategorie.UTILISATEUR,
      description: `Création utilisateur ${user.matricule}`,
      entiteType: 'UTILISATEUR',
      entiteId: user.id,
    });

    sendCreated(res, user, 'Utilisateur créé avec succès');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const id = Number(req.params.id);
    const user = await utilisateursService.update(id, req.body, req.user.id);

    auditLogger.fromRequest(req, {
      utilisateurId: req.user.id,
      action: AuditAction.MODIFICATION,
      categorie: AuditCategorie.UTILISATEUR,
      description: `Modification utilisateur ${user.matricule}`,
      entiteType: 'UTILISATEUR',
      entiteId: user.id,
    });

    sendSuccess(res, user, 'Utilisateur mis à jour avec succès');
  });

  deactivate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const id = Number(req.params.id);
    const user = await utilisateursService.deactivate(id, req.user.id);

    auditLogger.fromRequest(req, {
      utilisateurId: req.user.id,
      action: AuditAction.SUPPRESSION,
      categorie: AuditCategorie.UTILISATEUR,
      description: `Désactivation utilisateur ${user.matricule}`,
      entiteType: 'UTILISATEUR',
      entiteId: user.id,
    });

    sendSuccess(res, user, 'Utilisateur désactivé avec succès');
  });

  activate = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = await utilisateursService.activate(id);
    sendSuccess(res, user, 'Utilisateur activé avec succès');
  });

  assignRole = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const id = Number(req.params.id);
    const { roleId } = req.body as { roleId: number };
    const user = await utilisateursService.assignRole(id, roleId, req.user.id);
    sendSuccess(res, user, 'Rôle attribué avec succès');
  });
}

export const utilisateursController = new UtilisateursController();
