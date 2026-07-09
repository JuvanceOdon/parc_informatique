import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { AppError } from '../../shared/errors/index.js';
import { RoleCode } from '../../shared/constants/roles.constants.js';
import { utilisateursRepository } from '../utilisateurs/utilisateurs.repository.js';
import type { IServicesRepository } from './services.interfaces.js';
import type {
  CreateServiceInput,
  ServiceFilters,
  ServiceListQuery,
  ServiceResponse,
  ServiceRow,
  UpdateServiceInput,
} from './services.types.js';
import { servicesRepository } from './services.repository.js';

const RESPONSABLE_ROLES = [RoleCode.ADMIN, RoleCode.CHEF_SERVICE];

export class ServicesService {
  constructor(
    private readonly repository: IServicesRepository = servicesRepository,
  ) {}

  async list(
    query: ServiceListQuery,
    filters: ServiceFilters,
  ): Promise<{ data: ServiceResponse[]; total: number }> {
    const { rows, total } = await this.repository.findAll(query, filters);

    return {
      data: rows.map((row) => this.mapToResponse(row)),
      total,
    };
  }

  async getById(id: number): Promise<ServiceResponse> {
    const service = await this.repository.findById(id);

    if (!service) {
      throw AppError.notFound('Service introuvable');
    }

    return this.mapToResponse(service);
  }

  async create(input: CreateServiceInput): Promise<ServiceResponse> {
    await this.ensureUniqueCode(input.code);

    if (input.responsableId) {
      await this.validateResponsable(input.responsableId);
    }

    const created = await this.repository.create({
      ...input,
      code: input.code.toUpperCase(),
    });

    if (input.responsableId) {
      await this.linkResponsableToService(created.id, input.responsableId);
      const refreshed = await this.repository.findById(created.id);
      return this.mapToResponse(refreshed ?? created);
    }

    return this.mapToResponse(created);
  }

  async update(id: number, input: UpdateServiceInput): Promise<ServiceResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('Service introuvable');
    }

    if (input.code && input.code.toUpperCase() !== existing.code) {
      await this.ensureUniqueCode(input.code, id);
    }

    if (input.responsableId !== undefined && input.responsableId !== null) {
      await this.validateResponsable(input.responsableId);
    }

    const updated = await this.repository.update(id, {
      ...input,
      code: input.code?.toUpperCase(),
    });

    if (!updated) {
      throw AppError.notFound('Service introuvable');
    }

    if (input.responsableId !== undefined) {
      if (input.responsableId === null) {
        await this.repository.assignResponsable(id, null);
      } else {
        await this.linkResponsableToService(id, input.responsableId);
      }

      const refreshed = await this.repository.findById(id);
      return this.mapToResponse(refreshed ?? updated);
    }

    return this.mapToResponse(updated);
  }

  async deactivate(id: number): Promise<ServiceResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('Service introuvable');
    }

    if (!existing.actif) {
      throw AppError.badRequest('Service déjà désactivé');
    }

    const updated = await this.repository.setActif(id, false);

    if (!updated) {
      throw AppError.notFound('Service introuvable');
    }

    return this.mapToResponse(updated);
  }

  async activate(id: number): Promise<ServiceResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('Service introuvable');
    }

    if (existing.actif) {
      throw AppError.badRequest('Service déjà actif');
    }

    const updated = await this.repository.setActif(id, true);

    if (!updated) {
      throw AppError.notFound('Service introuvable');
    }

    return this.mapToResponse(updated);
  }

  async assignResponsable(
    serviceId: number,
    responsableId: number,
  ): Promise<ServiceResponse> {
    const service = await this.repository.findById(serviceId);

    if (!service) {
      throw AppError.notFound('Service introuvable');
    }

    if (!service.actif) {
      throw AppError.badRequest('Impossible d\'affecter un responsable à un service inactif');
    }

    await this.validateResponsable(responsableId);
    await this.linkResponsableToService(serviceId, responsableId);

    const updated = await this.repository.findById(serviceId);

    if (!updated) {
      throw AppError.notFound('Service introuvable');
    }

    return this.mapToResponse(updated);
  }

  async removeResponsable(serviceId: number): Promise<ServiceResponse> {
    const service = await this.repository.findById(serviceId);

    if (!service) {
      throw AppError.notFound('Service introuvable');
    }

    if (!service.responsableId) {
      throw AppError.badRequest('Ce service n\'a pas de responsable assigné');
    }

    await this.repository.assignResponsable(serviceId, null);

    const updated = await this.repository.findById(serviceId);

    if (!updated) {
      throw AppError.notFound('Service introuvable');
    }

    return this.mapToResponse(updated);
  }

  private async ensureUniqueCode(code: string, excludeId?: number): Promise<void> {
    const existing = await this.repository.findByCode(code);

    if (existing && existing.id !== excludeId) {
      throw AppError.conflict('Un service avec ce code existe déjà');
    }
  }

  private async validateResponsable(userId: number): Promise<void> {
    const user = await utilisateursRepository.findById(userId);

    if (!user) {
      throw AppError.notFound('Responsable introuvable');
    }

    if (!user.actif) {
      throw AppError.badRequest('Le responsable doit être un utilisateur actif');
    }

    if (!RESPONSABLE_ROLES.includes(user.roleCode as RoleCode)) {
      throw AppError.badRequest(
        'Le responsable doit avoir le rôle ADMIN ou CHEF_SERVICE',
      );
    }
  }

  private async linkResponsableToService(
    serviceId: number,
    responsableId: number,
  ): Promise<void> {
    await this.repository.assignResponsable(serviceId, responsableId);

    await db
      .update(utilisateurs)
      .set({ serviceId, updatedAt: new Date() })
      .where(eq(utilisateurs.id, responsableId));
  }

  private mapToResponse(row: ServiceRow): ServiceResponse {
    const responsable =
      row.responsableId &&
      row.responsableMatricule &&
      row.responsableNom &&
      row.responsablePrenom &&
      row.responsableEmail
        ? {
            id: row.responsableId,
            matricule: row.responsableMatricule,
            nom: row.responsableNom,
            prenom: row.responsablePrenom,
            email: row.responsableEmail,
          }
        : null;

    return {
      id: row.id,
      code: row.code,
      libelle: row.libelle,
      description: row.description,
      responsable,
      actif: row.actif,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

export const servicesService = new ServicesService();
