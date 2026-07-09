import type { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../utils/index.js';
import { AppError } from '../../shared/errors/index.js';
import { AuditAction, AuditCategorie } from '../../shared/constants/audit.constants.js';
import { auditLogger } from '../../utils/audit.logger.js';
import { authService } from './auth.service.js';

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const { identifiant, motDePasse } = req.body as {
      identifiant: string;
      motDePasse: string;
    };

    const result = await authService.login(identifiant, motDePasse);

    auditLogger.fromRequest(req, {
      utilisateurId: result.user.id,
      action: AuditAction.CONNEXION,
      categorie: AuditCategorie.AUTH,
      description: `Connexion réussie — ${result.user.matricule}`,
      entiteType: 'UTILISATEUR',
      entiteId: result.user.id,
    });

    sendSuccess(res, result, 'Connexion réussie');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const { refreshToken } = req.body as { refreshToken?: string };
    await authService.logout(req.user.id, refreshToken);

    auditLogger.fromRequest(req, {
      utilisateurId: req.user.id,
      action: AuditAction.DECONNEXION,
      categorie: AuditCategorie.AUTH,
      description: `Déconnexion — ${req.user.matricule}`,
      entiteType: 'UTILISATEUR',
      entiteId: req.user.id,
    });

    sendSuccess(res, null, 'Déconnexion réussie');
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, tokens, 'Token renouvelé avec succès');
  });

  profile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const profile = await authService.getProfile(req.user.id);
    sendSuccess(res, profile, 'Profil utilisateur');
  });
}

export const authController = new AuthController();
