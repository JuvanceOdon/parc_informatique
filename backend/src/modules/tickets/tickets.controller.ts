import type { Request, Response } from 'express';
import {
  asyncHandler,
  sendCreated,
  sendSuccess,
  buildPaginationMeta,
} from '../../utils/index.js';
import { AppError } from '../../shared/errors/index.js';
import { ticketsService } from './tickets.service.js';
import type { ListTicketsQueryInput } from './tickets.validation.js';

export class TicketsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const query = req.query as unknown as ListTicketsQueryInput;

    const { data, total } = await ticketsService.list(
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      {
        statut: query.statut,
        priorite: query.priorite,
        demandeurId: query.demandeurId,
        assigneeId: query.assigneeId,
        materielId: query.materielId,
        serviceId: query.serviceId,
        search: query.search,
        mesTicketsOnly: query.mesTicketsOnly,
      },
      req.user,
    );

    sendSuccess(
      res,
      data,
      'Liste des tickets',
      200,
      buildPaginationMeta(query.page, query.limit, total),
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const ticket = await ticketsService.getById(id, req.user);
    sendSuccess(res, ticket, 'Ticket récupéré');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const ticket = await ticketsService.create(req.body, req.user);
    sendCreated(res, ticket, 'Ticket créé avec succès');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const ticket = await ticketsService.update(id, req.body, req.user);
    sendSuccess(res, ticket, 'Ticket mis à jour');
  });

  changeStatut = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const ticket = await ticketsService.changeStatut(id, req.body, req.user);
    sendSuccess(res, ticket, 'Statut du ticket mis à jour');
  });

  changePriorite = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const ticket = await ticketsService.changePriorite(id, req.body, req.user);
    sendSuccess(res, ticket, 'Priorité du ticket mise à jour');
  });

  assign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const ticket = await ticketsService.assign(id, req.body, req.user);
    sendSuccess(res, ticket, 'Ticket assigné avec succès');
  });

  addCommentaire = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const commentaire = await ticketsService.addCommentaire(id, req.body, req.user);
    sendCreated(res, commentaire, 'Commentaire ajouté');
  });

  getCommentaires = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const commentaires = await ticketsService.getCommentaires(id, req.user);
    sendSuccess(res, commentaires, 'Commentaires du ticket');
  });

  addPieceJointe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);

    if (!req.file) {
      throw AppError.badRequest('Fichier requis');
    }

    const piece = await ticketsService.addPieceJointe(id, req.file, req.user);
    sendCreated(res, piece, 'Pièce jointe ajoutée');
  });

  deletePieceJointe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const ticketId = Number(req.params.id);
    const pieceId = Number(req.params.pieceId);
    await ticketsService.deletePieceJointe(ticketId, pieceId, req.user);
    sendSuccess(res, null, 'Pièce jointe supprimée');
  });

  getHistorique = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const id = Number(req.params.id);
    const historique = await ticketsService.getHistorique(id, req.user);
    sendSuccess(res, historique, 'Historique du ticket');
  });
}

export const ticketsController = new TicketsController();
