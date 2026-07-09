import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { AppError } from '../shared/errors/index.js';
import { authRepository } from '../modules/auth/auth.repository.js';
import type { RoleCode } from '../shared/constants/roles.constants.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Token d\'authentification manquant');
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const user = await authRepository.findByIdWithRole(payload.sub);

    if (!user) {
      throw AppError.unauthorized('Utilisateur introuvable');
    }

    if (!user.actif) {
      throw AppError.forbidden('Compte utilisateur désactivé');
    }

    req.user = {
      id: user.id,
      matricule: user.matricule,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      role: {
        id: user.roleId,
        code: user.roleCode as RoleCode,
        libelle: user.roleLibelle,
      },
      serviceId: user.serviceId,
      actif: user.actif,
      derniereConnexion: user.derniereConnexion,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize =
  (...allowedRoles: RoleCode[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }

    if (!allowedRoles.includes(req.user.role.code)) {
      next(AppError.forbidden('Vous n\'avez pas les droits suffisants pour cette action'));
      return;
    }

    next();
  };
