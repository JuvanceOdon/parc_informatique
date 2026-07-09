import { AppError } from '../../shared/errors/index.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { hashPassword } from '../../utils/password.util.js';
import { authRepository } from '../auth/auth.repository.js';
import type { IUtilisateursRepository } from './utilisateurs.interfaces.js';
import type {
  CreateUtilisateurInput,
  UpdateUtilisateurInput,
  UtilisateurFilters,
  UtilisateurListQuery,
  UtilisateurResponse,
  UtilisateurRow,
} from './utilisateurs.types.js';
import { utilisateursRepository } from './utilisateurs.repository.js';

export class UtilisateursService {
  constructor(
    private readonly repository: IUtilisateursRepository = utilisateursRepository,
  ) {}

  async list(
    query: UtilisateurListQuery,
    filters: UtilisateurFilters,
  ): Promise<{ data: UtilisateurResponse[]; total: number }> {
    const { rows, total } = await this.repository.findAll(query, filters);

    return {
      data: rows.map((row) => this.mapToResponse(row)),
      total,
    };
  }

  async getById(id: number): Promise<UtilisateurResponse> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw AppError.notFound('Utilisateur introuvable');
    }

    return this.mapToResponse(user);
  }

  async create(input: CreateUtilisateurInput): Promise<UtilisateurResponse> {
    await this.ensureRoleExists(input.roleId);
    await this.ensureUniqueEmail(input.email);
    await this.ensureUniqueMatricule(input.matricule);

    const hashedPassword = await hashPassword(input.motDePasse);
    const created = await this.repository.create({
      ...input,
      motDePasse: hashedPassword,
    });

    return this.mapToResponse(created);
  }

  async update(
    id: number,
    input: UpdateUtilisateurInput,
    currentUserId: number,
  ): Promise<UtilisateurResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('Utilisateur introuvable');
    }

    if (input.email && input.email.toLowerCase() !== existing.email) {
      await this.ensureUniqueEmail(input.email, id);
    }

    if (input.matricule && input.matricule.toUpperCase() !== existing.matricule) {
      await this.ensureUniqueMatricule(input.matricule, id);
    }

    if (input.roleId !== undefined) {
      await this.ensureRoleExists(input.roleId);
      await this.ensureNotLastAdminDemotion(existing, input.roleId, currentUserId);
    }

    const updatePayload: UpdateUtilisateurInput & { motDePasse?: string } = { ...input };

    if (input.motDePasse) {
      updatePayload.motDePasse = await hashPassword(input.motDePasse);
    }

    const updated = await this.repository.update(id, updatePayload);

    if (!updated) {
      throw AppError.notFound('Utilisateur introuvable');
    }

    if (input.roleId !== undefined || input.motDePasse !== undefined) {
      await authRepository.revokeAllUserTokens(id);
    }

    return this.mapToResponse(updated);
  }

  async deactivate(id: number, currentUserId: number): Promise<UtilisateurResponse> {
    if (id === currentUserId) {
      throw AppError.badRequest('Vous ne pouvez pas désactiver votre propre compte');
    }

    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('Utilisateur introuvable');
    }

    if (!existing.actif) {
      throw AppError.badRequest('Utilisateur déjà désactivé');
    }

    await this.ensureNotLastAdminDeactivation(existing);

    const updated = await this.repository.setActif(id, false);

    if (!updated) {
      throw AppError.notFound('Utilisateur introuvable');
    }

    await authRepository.revokeAllUserTokens(id);

    return this.mapToResponse(updated);
  }

  async activate(id: number): Promise<UtilisateurResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('Utilisateur introuvable');
    }

    if (existing.actif) {
      throw AppError.badRequest('Utilisateur déjà actif');
    }

    const updated = await this.repository.setActif(id, true);

    if (!updated) {
      throw AppError.notFound('Utilisateur introuvable');
    }

    return this.mapToResponse(updated);
  }

  async assignRole(
    id: number,
    roleId: number,
    currentUserId: number,
  ): Promise<UtilisateurResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('Utilisateur introuvable');
    }

    await this.ensureRoleExists(roleId);
    await this.ensureNotLastAdminDemotion(existing, roleId, currentUserId);

    const updated = await this.repository.update(id, { roleId });

    if (!updated) {
      throw AppError.notFound('Utilisateur introuvable');
    }

    await authRepository.revokeAllUserTokens(id);

    return this.mapToResponse(updated);
  }

  private async ensureRoleExists(roleId: number): Promise<void> {
    const exists = await this.repository.roleExists(roleId);

    if (!exists) {
      throw AppError.notFound('Rôle introuvable');
    }
  }

  private async ensureUniqueEmail(email: string, excludeId?: number): Promise<void> {
    const existing = await this.repository.findByEmail(email);

    if (existing && existing.id !== excludeId) {
      throw AppError.conflict('Un utilisateur avec cet email existe déjà');
    }
  }

  private async ensureUniqueMatricule(matricule: string, excludeId?: number): Promise<void> {
    const existing = await this.repository.findByMatricule(matricule);

    if (existing && existing.id !== excludeId) {
      throw AppError.conflict('Un utilisateur avec ce matricule existe déjà');
    }
  }

  private async ensureNotLastAdminDeactivation(user: UtilisateurRow): Promise<void> {
    if (user.roleCode === RoleCode.ADMIN && user.actif) {
      const adminCount = await this.repository.countAdmins();

      if (adminCount <= 1) {
        throw AppError.badRequest('Impossible de désactiver le dernier administrateur actif');
      }
    }
  }

  private async ensureNotLastAdminDemotion(
    user: UtilisateurRow,
    newRoleId: number,
    currentUserId: number,
  ): Promise<void> {
    if (user.roleCode !== RoleCode.ADMIN || user.roleId === newRoleId) {
      return;
    }

    const adminCount = await this.repository.countAdmins();

    if (adminCount <= 1) {
      throw AppError.badRequest('Impossible de retirer le rôle du dernier administrateur actif');
    }

    if (user.id === currentUserId) {
      throw AppError.badRequest('Vous ne pouvez pas modifier votre propre rôle administrateur');
    }
  }

  private mapToResponse(row: UtilisateurRow): UtilisateurResponse {
    return {
      id: row.id,
      matricule: row.matricule,
      email: row.email,
      nom: row.nom,
      prenom: row.prenom,
      telephone: row.telephone,
      role: {
        id: row.roleId,
        code: row.roleCode as RoleCode,
        libelle: row.roleLibelle,
      },
      serviceId: row.serviceId,
      actif: row.actif,
      derniereConnexion: row.derniereConnexion,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

export const utilisateursService = new UtilisateursService();
