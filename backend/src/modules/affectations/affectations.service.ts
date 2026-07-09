import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { AppError } from '../../shared/errors/index.js';
import {
  AffectationStatut,
} from '../../shared/constants/affectation.constants.js';
import {
  MaterielHistoriqueAction,
  MaterielStatut,
} from '../../shared/constants/materiel.constants.js';
import { materielsRepository } from '../materiels/materiels.repository.js';
import { utilisateursRepository } from '../utilisateurs/utilisateurs.repository.js';
import type { IAffectationsRepository } from './affectations.interfaces.js';
import type {
  AffectationFilters,
  AffectationListQuery,
  AffectationResponse,
  AffectationRow,
  CreateAffectationInput,
  TerminerAffectationInput,
  TransferAffectationInput,
  UpdateAffectationInput,
} from './affectations.types.js';
import { affectationsRepository } from './affectations.repository.js';
import { notificationDispatcher } from '../notifications/notifications.dispatcher.js';

export class AffectationsService {
  constructor(
    private readonly repository: IAffectationsRepository = affectationsRepository,
  ) {}

  async list(
    query: AffectationListQuery,
    filters: AffectationFilters,
  ): Promise<{ data: AffectationResponse[]; total: number }> {
    const { rows, total } = await this.repository.findAll(query, filters);
    return { data: rows.map((row) => this.mapToResponse(row)), total };
  }

  async getById(id: number): Promise<AffectationResponse> {
    const affectation = await this.repository.findById(id);
    if (!affectation) throw AppError.notFound('Affectation introuvable');
    return this.mapToResponse(affectation);
  }

  async getActiveByMaterielId(materielId: number): Promise<AffectationResponse | null> {
    const affectation = await this.repository.findActiveByMaterielId(materielId);
    return affectation ? this.mapToResponse(affectation) : null;
  }

  async getHistoriqueByMaterielId(materielId: number): Promise<AffectationResponse[]> {
    await this.ensureMaterielExists(materielId);
    const rows = await this.repository.findByMaterielId(materielId);
    return rows.map((row) => this.mapToResponse(row));
  }

  async getByUtilisateurId(utilisateurId: number): Promise<AffectationResponse[]> {
    await this.ensureUtilisateurExists(utilisateurId);
    const rows = await this.repository.findByUtilisateurId(utilisateurId);
    return rows.map((row) => this.mapToResponse(row));
  }

  async create(input: CreateAffectationInput, userId: number): Promise<AffectationResponse> {
    const materiel = await materielsRepository.findById(input.materielId);
    if (!materiel || !materiel.actif) {
      throw AppError.notFound('Matériel introuvable ou inactif');
    }

    const utilisateur = await utilisateursRepository.findById(input.utilisateurId);
    if (!utilisateur || !utilisateur.actif) {
      throw AppError.notFound('Utilisateur introuvable ou inactif');
    }

    const active = await this.repository.findActiveByMaterielId(input.materielId);
    if (active) {
      throw AppError.conflict(
        'Ce matériel est déjà affecté. Utilisez le transfert ou terminez l\'affectation active.',
      );
    }

    const serviceId = input.serviceId ?? utilisateur.serviceId ?? materiel.serviceId ?? null;

    if (serviceId) {
      const serviceExists = await materielsRepository.serviceExists(serviceId);
      if (!serviceExists) throw AppError.notFound('Service introuvable ou inactif');
    }

    const created = await this.repository.create({
      ...input,
      affecteParId: userId,
      serviceId,
    });

    await this.updateMaterielOnAffectation(
      input.materielId,
      MaterielStatut.EN_SERVICE,
      serviceId,
      input.localisation ?? materiel.localisation,
    );

    await materielsRepository.addHistorique({
      materielId: input.materielId,
      utilisateurId: userId,
      action: MaterielHistoriqueAction.MODIFICATION,
      description: `Affectation à ${utilisateur.prenom} ${utilisateur.nom} (${utilisateur.matricule})`,
      nouvelleValeur: {
        utilisateurId: input.utilisateurId,
        serviceId,
        localisation: input.localisation,
      },
    });

    void notificationDispatcher.onAffectationCreated({
      affectationId: created.id,
      utilisateurId: input.utilisateurId,
      materielCode: materiel.codeMateriel,
      materielDesignation: materiel.designation,
    });

    return this.mapToResponse(created);
  }

  async update(
    id: number,
    input: UpdateAffectationInput,
    userId: number,
  ): Promise<AffectationResponse> {
    const current = await this.repository.findById(id);
    if (!current) throw AppError.notFound('Affectation introuvable');

    if (current.statut !== AffectationStatut.ACTIVE) {
      throw AppError.badRequest('Seule une affectation active peut être modifiée');
    }

    if (input.serviceId !== undefined && input.serviceId !== null) {
      const serviceExists = await materielsRepository.serviceExists(input.serviceId);
      if (!serviceExists) throw AppError.notFound('Service introuvable ou inactif');
    }

    const updated = await this.repository.update(id, input);
    if (!updated) throw AppError.notFound('Affectation introuvable');

    const serviceId = input.serviceId !== undefined ? input.serviceId : current.serviceId;
    const localisation =
      input.localisation !== undefined ? input.localisation : current.localisation;

    if (input.serviceId !== undefined || input.localisation !== undefined) {
      await this.updateMaterielOnAffectation(
        current.materielId,
        MaterielStatut.EN_SERVICE,
        serviceId,
        localisation,
      );
    }

    await materielsRepository.addHistorique({
      materielId: current.materielId,
      utilisateurId: userId,
      action: MaterielHistoriqueAction.MODIFICATION,
      description: `Mise à jour de l'affectation #${current.id}`,
      nouvelleValeur: input,
    });

    return this.mapToResponse(updated);
  }

  async transfer(
    affectationId: number,
    input: TransferAffectationInput,
    userId: number,
  ): Promise<AffectationResponse> {
    const current = await this.repository.findById(affectationId);
    if (!current) throw AppError.notFound('Affectation introuvable');

    if (current.statut !== AffectationStatut.ACTIVE) {
      throw AppError.badRequest('Seule une affectation active peut être transférée');
    }

    if (current.utilisateurId === input.nouvelUtilisateurId) {
      throw AppError.badRequest('Le matériel est déjà affecté à cet utilisateur');
    }

    const nouvelUtilisateur = await utilisateursRepository.findById(input.nouvelUtilisateurId);
    if (!nouvelUtilisateur || !nouvelUtilisateur.actif) {
      throw AppError.notFound('Nouvel utilisateur introuvable ou inactif');
    }

    await this.repository.closeAffectation(
      affectationId,
      AffectationStatut.TRANSFEREE,
      input.motif ?? `Transfert vers ${nouvelUtilisateur.matricule}`,
    );

    const serviceId =
      input.serviceId ?? nouvelUtilisateur.serviceId ?? current.serviceId ?? null;

    const newAffectation = await this.repository.create({
      materielId: current.materielId,
      utilisateurId: input.nouvelUtilisateurId,
      serviceId,
      localisation: input.localisation ?? current.localisation,
      motif: input.motif ?? `Transfert depuis ${current.utilisateurMatricule}`,
      affecteParId: userId,
    });

    await this.updateMaterielOnAffectation(
      current.materielId,
      MaterielStatut.EN_SERVICE,
      serviceId,
      input.localisation ?? current.localisation,
    );

    await materielsRepository.addHistorique({
      materielId: current.materielId,
      utilisateurId: userId,
      action: MaterielHistoriqueAction.MODIFICATION,
      description: `Transfert de ${current.utilisateurPrenom} ${current.utilisateurNom} vers ${nouvelUtilisateur.prenom} ${nouvelUtilisateur.nom}`,
      ancienneValeur: { utilisateurId: current.utilisateurId },
      nouvelleValeur: { utilisateurId: input.nouvelUtilisateurId },
    });

    void notificationDispatcher.onAffectationTransfer({
      affectationId: newAffectation.id,
      utilisateurId: input.nouvelUtilisateurId,
      materielCode: current.materielCode,
      materielDesignation: current.materielDesignation,
    });

    return this.mapToResponse(newAffectation);
  }

  async terminer(
    affectationId: number,
    input: TerminerAffectationInput,
    userId: number,
  ): Promise<AffectationResponse> {
    const current = await this.repository.findById(affectationId);
    if (!current) throw AppError.notFound('Affectation introuvable');

    if (current.statut !== AffectationStatut.ACTIVE) {
      throw AppError.badRequest('Cette affectation n\'est pas active');
    }

    const closed = await this.repository.closeAffectation(
      affectationId,
      AffectationStatut.TERMINEE,
      input.motif ?? 'Restitution du matériel',
    );

    if (!closed) throw AppError.notFound('Affectation introuvable');

    await this.updateMaterielOnAffectation(
      current.materielId,
      MaterielStatut.EN_STOCK,
      current.serviceId,
      current.localisation,
    );

    await materielsRepository.addHistorique({
      materielId: current.materielId,
      utilisateurId: userId,
      action: MaterielHistoriqueAction.MODIFICATION,
      description: `Fin d'affectation — restitution par ${current.utilisateurPrenom} ${current.utilisateurNom}`,
      ancienneValeur: { utilisateurId: current.utilisateurId, statut: AffectationStatut.ACTIVE },
      nouvelleValeur: { statut: AffectationStatut.TERMINEE },
    });

    return this.mapToResponse(closed);
  }

  private async ensureMaterielExists(materielId: number): Promise<void> {
    const materiel = await materielsRepository.findById(materielId);
    if (!materiel) throw AppError.notFound('Matériel introuvable');
  }

  private async ensureUtilisateurExists(utilisateurId: number): Promise<void> {
    const user = await utilisateursRepository.findById(utilisateurId);
    if (!user) throw AppError.notFound('Utilisateur introuvable');
  }

  private async updateMaterielOnAffectation(
    materielId: number,
    statut: MaterielStatut,
    serviceId: number | null,
    localisation: string | null,
  ): Promise<void> {
    await db
      .update(materiels)
      .set({
        statut,
        serviceId,
        localisation,
        updatedAt: new Date(),
      })
      .where(eq(materiels.id, materielId));
  }

  private mapToResponse(row: AffectationRow): AffectationResponse {
    return {
      id: row.id,
      materiel: {
        id: row.materielId,
        codeMateriel: row.materielCode,
        designation: row.materielDesignation,
        numeroSerie: row.materielNumeroSerie,
      },
      utilisateur: {
        id: row.utilisateurId,
        matricule: row.utilisateurMatricule,
        nom: row.utilisateurNom,
        prenom: row.utilisateurPrenom,
        email: row.utilisateurEmail,
      },
      service: row.serviceId
        ? {
            id: row.serviceId,
            code: row.serviceCode!,
            libelle: row.serviceLibelle!,
          }
        : null,
      localisation: row.localisation,
      dateDebut: row.dateDebut,
      dateFin: row.dateFin,
      statut: row.statut as AffectationStatut,
      motif: row.motif,
      affectePar: row.affecteParId
        ? {
            id: row.affecteParId,
            matricule: row.affecteParMatricule!,
            nom: row.affecteParNom!,
            prenom: row.affecteParPrenom!,
            email: row.affecteParEmail!,
          }
        : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

export const affectationsService = new AffectationsService();
