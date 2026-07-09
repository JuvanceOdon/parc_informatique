import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { AppError } from '../../shared/errors/index.js';
import {
  MaintenanceHistoriqueAction,
  MaintenanceStatut,
  MaintenanceType,
  isMaintenanceTerminal,
} from '../../shared/constants/maintenance.constants.js';
import {
  MaterielEtat,
  MaterielHistoriqueAction,
  MaterielStatut,
} from '../../shared/constants/materiel.constants.js';
import { materielsRepository } from '../materiels/materiels.repository.js';
import type { IMaintenancesRepository } from './maintenances.interfaces.js';
import type {
  AnnulerMaintenanceInput,
  CreateMaintenanceInput,
  DiagnosticMaintenanceInput,
  MaintenanceFilters,
  MaintenanceHistoriqueResponse,
  MaintenanceListQuery,
  MaintenanceResponse,
  MaintenanceRow,
  SolutionMaintenanceInput,
  UpdateMaintenanceInput,
} from './maintenances.types.js';
import { maintenancesRepository } from './maintenances.repository.js';
import { notificationDispatcher } from '../notifications/notifications.dispatcher.js';

export class MaintenancesService {
  constructor(
    private readonly repository: IMaintenancesRepository = maintenancesRepository,
  ) {}

  async list(
    query: MaintenanceListQuery,
    filters: MaintenanceFilters,
  ): Promise<{ data: MaintenanceResponse[]; total: number }> {
    const { rows, total } = await this.repository.findAll(query, filters);
    return { data: rows.map((row) => this.mapToResponse(row)), total };
  }

  async getById(id: number): Promise<MaintenanceResponse> {
    const maintenance = await this.repository.findById(id);
    if (!maintenance) throw AppError.notFound('Maintenance introuvable');
    return this.mapToResponse(maintenance);
  }

  async getActiveByMaterielId(materielId: number): Promise<MaintenanceResponse | null> {
    const maintenance = await this.repository.findActiveByMaterielId(materielId);
    return maintenance ? this.mapToResponse(maintenance) : null;
  }

  async getHistoriqueByMaterielId(materielId: number): Promise<MaintenanceResponse[]> {
    const materiel = await this.repository.materielExists(materielId);
    if (!materiel) throw AppError.notFound('Matériel introuvable ou inactif');

    const rows = await this.repository.findByMaterielId(materielId);
    return rows.map((row) => this.mapToResponse(row));
  }

  async getHistorique(id: number): Promise<MaintenanceHistoriqueResponse[]> {
    const maintenance = await this.repository.findById(id);
    if (!maintenance) throw AppError.notFound('Maintenance introuvable');

    const rows = await this.repository.getHistorique(id);
    return rows.map((row) => this.mapHistoriqueToResponse(row));
  }

  async create(input: CreateMaintenanceInput, userId: number): Promise<MaintenanceResponse> {
    const materiel = await this.repository.materielExists(input.materielId);
    if (!materiel) throw AppError.notFound('Matériel introuvable ou inactif');

    if (materiel.statut === MaterielStatut.REFORME) {
      throw AppError.badRequest('Impossible de créer une maintenance sur un matériel réformé');
    }

    const active = await this.repository.findActiveByMaterielId(input.materielId);
    if (active) {
      throw AppError.conflict('Une maintenance active existe déjà pour ce matériel');
    }

    if (input.ticketId) {
      const ticketExists = await this.repository.ticketExists(input.ticketId);
      if (!ticketExists) throw AppError.notFound('Ticket introuvable');

      if (input.type !== MaintenanceType.CORRECTIVE) {
        throw AppError.badRequest('Seule une maintenance corrective peut être liée à un ticket');
      }
    }

    if (input.technicienId) {
      const exists = await this.repository.technicienExists(input.technicienId);
      if (!exists) throw AppError.notFound('Technicien introuvable ou inactif');
    }

    const numeroMaintenance = await this.repository.generateNextCode();
    const demarrer = input.demarrer ?? false;
    const statut = demarrer ? MaintenanceStatut.EN_COURS : MaintenanceStatut.PLANIFIEE;

    const created = await this.repository.create({
      ...input,
      numeroMaintenance,
      createdById: userId,
      statut,
      statutMaterielAvant: demarrer ? (materiel.statut as MaterielStatut) : null,
      etatMaterielAvant: demarrer ? (materiel.etat as MaterielEtat) : null,
      dateDebut: demarrer ? new Date() : null,
    });

    if (demarrer) {
      await this.setMaterielStatut(
        input.materielId,
        MaterielStatut.EN_MAINTENANCE,
        userId,
        `Maintenance ${numeroMaintenance} démarrée`,
      );
    }

    await this.repository.addHistorique({
      maintenanceId: created.id,
      utilisateurId: userId,
      action: MaintenanceHistoriqueAction.CREATION,
      description: `Création de la maintenance ${numeroMaintenance}`,
      nouvelleValeur: { type: input.type, statut, titre: input.titre },
    });

    if (demarrer) {
      void notificationDispatcher.onMaintenanceStarted({
        maintenanceId: created.id,
        numeroMaintenance,
        titre: input.titre,
        materielCode: created.materielCode,
        technicienId: input.technicienId ?? null,
      });
    }

    return this.mapToResponse(created);
  }

  async update(
    id: number,
    input: UpdateMaintenanceInput,
    userId: number,
  ): Promise<MaintenanceResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Maintenance introuvable');

    if (isMaintenanceTerminal(existing.statut as MaintenanceStatut)) {
      throw AppError.badRequest('Une maintenance clôturée ne peut plus être modifiée');
    }

    if (input.technicienId !== undefined && input.technicienId !== null) {
      const exists = await this.repository.technicienExists(input.technicienId);
      if (!exists) throw AppError.notFound('Technicien introuvable ou inactif');
    }

    if (input.diagnostic !== undefined) {
      const statut = existing.statut as MaintenanceStatut;
      if (statut !== MaintenanceStatut.EN_COURS && statut !== MaintenanceStatut.DIAGNOSTIC) {
        throw AppError.badRequest('Le diagnostic ne peut être modifié que sur une maintenance en cours');
      }
      if (input.diagnostic !== null && input.diagnostic.length < 10) {
        throw AppError.badRequest('Le diagnostic doit contenir au moins 10 caractères');
      }
    }

    const updated = await this.repository.update(id, input);
    if (!updated) throw AppError.notFound('Maintenance introuvable');

    await this.repository.addHistorique({
      maintenanceId: id,
      utilisateurId: userId,
      action: MaintenanceHistoriqueAction.MODIFICATION,
      description: `Mise à jour de la maintenance ${existing.numeroMaintenance}`,
      nouvelleValeur: input,
    });

    return this.mapToResponse(updated);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Maintenance introuvable');

    if (existing.statut !== MaintenanceStatut.PLANIFIEE) {
      throw AppError.badRequest(
        'Seule une maintenance planifiée peut être supprimée. Utilisez l\'annulation pour les autres statuts.',
      );
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) throw AppError.notFound('Maintenance introuvable');
  }

  async demarrer(id: number, userId: number): Promise<MaintenanceResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Maintenance introuvable');

    if (existing.statut !== MaintenanceStatut.PLANIFIEE) {
      throw AppError.badRequest('Seule une maintenance planifiée peut être démarrée');
    }

    const materiel = await this.repository.materielExists(existing.materielId);
    if (!materiel) throw AppError.notFound('Matériel introuvable ou inactif');

    const now = new Date();

    const updated = await this.repository.updateStatutWithSnapshots(
      id,
      MaintenanceStatut.EN_COURS,
      {
        dateDebut: now,
        statutMaterielAvant: materiel.statut as MaterielStatut,
        etatMaterielAvant: materiel.etat as MaterielEtat,
      },
    );

    if (!updated) throw AppError.notFound('Maintenance introuvable');

    await this.setMaterielStatut(
      existing.materielId,
      MaterielStatut.EN_MAINTENANCE,
      userId,
      `Maintenance ${existing.numeroMaintenance} démarrée`,
    );

    await this.repository.addHistorique({
      maintenanceId: id,
      utilisateurId: userId,
      action: MaintenanceHistoriqueAction.DEMARRAGE,
      description: `Démarrage de la maintenance ${existing.numeroMaintenance}`,
      ancienneValeur: { statut: MaintenanceStatut.PLANIFIEE },
      nouvelleValeur: { statut: MaintenanceStatut.EN_COURS },
    });

    void notificationDispatcher.onMaintenanceStarted({
      maintenanceId: id,
      numeroMaintenance: existing.numeroMaintenance,
      titre: existing.titre,
      materielCode: existing.materielCode,
      technicienId: existing.technicienId,
    });

    return this.mapToResponse(updated);
  }

  async enregistrerDiagnostic(
    id: number,
    input: DiagnosticMaintenanceInput,
    userId: number,
  ): Promise<MaintenanceResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Maintenance introuvable');

    if (
      existing.statut !== MaintenanceStatut.EN_COURS &&
      existing.statut !== MaintenanceStatut.DIAGNOSTIC
    ) {
      throw AppError.badRequest('Le diagnostic ne peut être enregistré que sur une maintenance en cours');
    }

    const updated = await this.repository.updateDiagnostic(id, input.diagnostic);
    if (!updated) throw AppError.notFound('Maintenance introuvable');

    await this.repository.addHistorique({
      maintenanceId: id,
      utilisateurId: userId,
      action: MaintenanceHistoriqueAction.DIAGNOSTIC,
      description: `Diagnostic enregistré pour ${existing.numeroMaintenance}`,
      nouvelleValeur: { diagnostic: input.diagnostic },
    });

    return this.mapToResponse(updated);
  }

  async enregistrerSolution(
    id: number,
    input: SolutionMaintenanceInput,
    userId: number,
  ): Promise<MaintenanceResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Maintenance introuvable');

    if (
      existing.statut !== MaintenanceStatut.EN_COURS &&
      existing.statut !== MaintenanceStatut.DIAGNOSTIC
    ) {
      throw AppError.badRequest('La solution ne peut être enregistrée que sur une maintenance active');
    }

    const etatMaterielApres = input.etatMaterielApres ?? (existing.materielEtat as MaterielEtat);
    let statutMaterielApres = input.statutMaterielApres;

    if (!statutMaterielApres) {
      const hasAffectation = await this.repository.hasActiveAffectation(existing.materielId);
      statutMaterielApres = hasAffectation
        ? MaterielStatut.EN_SERVICE
        : MaterielStatut.EN_STOCK;
    }

    const now = new Date();
    const updated = await this.repository.updateSolution(id, {
      solution: input.solution,
      statutMaterielApres,
      etatMaterielApres,
      cout: input.cout != null ? String(input.cout) : existing.cout,
      dateFin: now,
    });

    if (!updated) throw AppError.notFound('Maintenance introuvable');

    await db
      .update(materiels)
      .set({
        statut: statutMaterielApres,
        etat: etatMaterielApres,
        updatedAt: now,
      })
      .where(eq(materiels.id, existing.materielId));

    await materielsRepository.addHistorique({
      materielId: existing.materielId,
      utilisateurId: userId,
      action: MaterielHistoriqueAction.MAINTENANCE,
      description: `Maintenance ${existing.numeroMaintenance} terminée — ${input.solution.slice(0, 100)}`,
      ancienneValeur: {
        statut: existing.statutMaterielAvant ?? existing.materielStatut,
        etat: existing.etatMaterielAvant ?? existing.materielEtat,
      },
      nouvelleValeur: { statut: statutMaterielApres, etat: etatMaterielApres },
    });

    await this.repository.addHistorique({
      maintenanceId: id,
      utilisateurId: userId,
      action: MaintenanceHistoriqueAction.SOLUTION,
      description: `Solution appliquée — maintenance ${existing.numeroMaintenance} terminée`,
      nouvelleValeur: {
        solution: input.solution,
        statutMaterielApres,
        etatMaterielApres,
      },
    });

    void notificationDispatcher.onMaintenanceCompleted({
      maintenanceId: id,
      numeroMaintenance: existing.numeroMaintenance,
      titre: existing.titre,
      materielCode: existing.materielCode,
      createdById: existing.createdById,
      technicienId: existing.technicienId,
    });

    return this.mapToResponse(updated);
  }

  async annuler(
    id: number,
    input: AnnulerMaintenanceInput,
    userId: number,
  ): Promise<MaintenanceResponse> {
    const existing = await this.repository.findById(id);
    if (!materielExistsCheck(existing)) throw AppError.notFound('Maintenance introuvable');

    if (isMaintenanceTerminal(existing.statut as MaintenanceStatut)) {
      throw AppError.badRequest('Cette maintenance est déjà clôturée');
    }

    const now = new Date();
    const updated = await this.repository.updateStatut(id, MaintenanceStatut.ANNULEE, {
      dateFin: now,
    });

    if (!updated) throw AppError.notFound('Maintenance introuvable');

    const statutRestaure =
      (existing.statutMaterielAvant as MaterielStatut | null) ??
      (existing.materielStatut as MaterielStatut);
    const etatRestaure =
      (existing.etatMaterielAvant as MaterielEtat | null) ??
      (existing.materielEtat as MaterielEtat);

    if (existing.statut !== MaintenanceStatut.PLANIFIEE) {
      await db
        .update(materiels)
        .set({
          statut: statutRestaure,
          etat: etatRestaure,
          updatedAt: now,
        })
        .where(eq(materiels.id, existing.materielId));

      await materielsRepository.addHistorique({
        materielId: existing.materielId,
        utilisateurId: userId,
        action: MaterielHistoriqueAction.MAINTENANCE,
        description: `Maintenance ${existing.numeroMaintenance} annulée — état matériel restauré`,
        nouvelleValeur: { statut: statutRestaure, etat: etatRestaure },
      });
    }

    await this.repository.addHistorique({
      maintenanceId: id,
      utilisateurId: userId,
      action: MaintenanceHistoriqueAction.ANNULATION,
      description: input.motif ?? `Maintenance ${existing.numeroMaintenance} annulée`,
      ancienneValeur: { statut: existing.statut },
      nouvelleValeur: { statut: MaintenanceStatut.ANNULEE },
    });

    return this.mapToResponse(updated);
  }

  async reprendre(id: number, userId: number): Promise<MaintenanceResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Maintenance introuvable');

    if (existing.statut !== MaintenanceStatut.DIAGNOSTIC) {
      throw AppError.badRequest('Seule une maintenance en diagnostic peut reprendre l\'intervention');
    }

    const updated = await this.repository.updateStatut(id, MaintenanceStatut.EN_COURS, {});
    if (!updated) throw AppError.notFound('Maintenance introuvable');

    await this.repository.addHistorique({
      maintenanceId: id,
      utilisateurId: userId,
      action: MaintenanceHistoriqueAction.MODIFICATION,
      description: `Reprise de l'intervention ${existing.numeroMaintenance}`,
      ancienneValeur: { statut: MaintenanceStatut.DIAGNOSTIC },
      nouvelleValeur: { statut: MaintenanceStatut.EN_COURS },
    });

    return this.mapToResponse(updated);
  }

  private async setMaterielStatut(
    materielId: number,
    statut: MaterielStatut,
    userId: number,
    description: string,
  ): Promise<void> {
    const materiel = await materielsRepository.findById(materielId);
    if (!materiel) return;

    await db
      .update(materiels)
      .set({ statut, updatedAt: new Date() })
      .where(eq(materiels.id, materielId));

    await materielsRepository.addHistorique({
      materielId,
      utilisateurId: userId,
      action: MaterielHistoriqueAction.CHANGEMENT_STATUT,
      description,
      ancienneValeur: { statut: materiel.statut },
      nouvelleValeur: { statut },
    });
  }

  private mapToResponse(row: MaintenanceRow): MaintenanceResponse {
    return {
      id: row.id,
      numeroMaintenance: row.numeroMaintenance,
      materiel: {
        id: row.materielId,
        codeMateriel: row.materielCode,
        designation: row.materielDesignation,
        numeroSerie: row.materielNumeroSerie,
        statut: row.materielStatut as MaterielStatut,
        etat: row.materielEtat as MaterielEtat,
      },
      ticket: row.ticketId
        ? {
            id: row.ticketId,
            numeroTicket: row.ticketNumero!,
            titre: row.ticketTitre!,
          }
        : null,
      type: row.type as MaintenanceType,
      statut: row.statut as MaintenanceStatut,
      titre: row.titre,
      description: row.description,
      diagnostic: row.diagnostic,
      solution: row.solution,
      technicien: row.technicienId
        ? {
            id: row.technicienId,
            matricule: row.technicienMatricule!,
            nom: row.technicienNom!,
            prenom: row.technicienPrenom!,
            email: row.technicienEmail!,
          }
        : null,
      statutMaterielAvant: row.statutMaterielAvant as MaterielStatut | null,
      etatMaterielAvant: row.etatMaterielAvant as MaterielEtat | null,
      statutMaterielApres: row.statutMaterielApres as MaterielStatut | null,
      etatMaterielApres: row.etatMaterielApres as MaterielEtat | null,
      datePlanifiee: row.datePlanifiee,
      dateDebut: row.dateDebut,
      dateFin: row.dateFin,
      cout: row.cout,
      createdBy: {
        id: row.createdById,
        matricule: row.createdByMatricule,
        nom: row.createdByNom,
        prenom: row.createdByPrenom,
        email: row.createdByEmail,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapHistoriqueToResponse(
    row: import('./maintenances.types.js').MaintenanceHistoriqueRow,
  ): MaintenanceHistoriqueResponse {
    return {
      id: row.id,
      action: row.action,
      description: row.description,
      ancienneValeur: row.ancienneValeur,
      nouvelleValeur: row.nouvelleValeur,
      utilisateur: row.utilisateurId
        ? {
            id: row.utilisateurId,
            matricule: row.utilisateurMatricule!,
            nom: row.utilisateurNom!,
            prenom: row.utilisateurPrenom!,
            email: row.utilisateurEmail!,
          }
        : null,
      createdAt: row.createdAt,
    };
  }
}

const materielExistsCheck = (
  maintenance: MaintenanceRow | null,
): maintenance is MaintenanceRow => !!maintenance;

export const maintenancesService = new MaintenancesService();
