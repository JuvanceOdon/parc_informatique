import { AppError } from '../../shared/errors/index.js';
import {
  MaterielEtat,
  MaterielHistoriqueAction,
  MaterielStatut,
} from '../../shared/constants/materiel.constants.js';
import { generateMaterielQrCode } from '../../utils/qrcode.util.js';
import {
  deleteMaterielImageFile,
  getMaterielImageUrl,
} from '../../middlewares/materiel-upload.middleware.js';
import type { IMaterielsRepository } from './materiels.interfaces.js';
import type {
  CreateMaterielInput,
  MaterielFilters,
  MaterielHistoriqueResponse,
  MaterielListQuery,
  MaterielResponse,
  MaterielRow,
  QrCodeResponse,
  UpdateMaterielInput,
} from './materiels.types.js';
import { materielsRepository } from './materiels.repository.js';
import { AuditAction, AuditCategorie } from '../../shared/constants/audit.constants.js';
import { auditLogger } from '../../utils/audit.logger.js';

export class MaterielsService {
  constructor(
    private readonly repository: IMaterielsRepository = materielsRepository,
  ) {}

  async list(
    query: MaterielListQuery,
    filters: MaterielFilters,
  ): Promise<{ data: MaterielResponse[]; total: number }> {
    const { rows, total } = await this.repository.findAll(query, filters);
    const data = await Promise.all(rows.map((row) => this.mapToResponse(row, false)));
    return { data, total };
  }

  async getById(id: number): Promise<MaterielResponse> {
    const materiel = await this.repository.findById(id);
    if (!materiel) throw AppError.notFound('Matériel introuvable');
    return this.mapToResponse(materiel, true);
  }

  async getByCode(codeMateriel: string): Promise<MaterielResponse> {
    const materiel = await this.repository.findByCode(codeMateriel);
    if (!materiel) throw AppError.notFound('Matériel introuvable');
    return this.mapToResponse(materiel, true);
  }

  async create(input: CreateMaterielInput, userId: number): Promise<MaterielResponse> {
    await this.validateReferences(input.categorieId, input.serviceId);

    if (input.numeroSerie) {
      await this.ensureUniqueNumeroSerie(input.numeroSerie);
    }

    const codeMateriel = await this.repository.generateNextCode();
    const created = await this.repository.create({ ...input, codeMateriel });

    await this.repository.addHistorique({
      materielId: created.id,
      utilisateurId: userId,
      action: MaterielHistoriqueAction.CREATION,
      description: `Création du matériel ${codeMateriel}`,
      nouvelleValeur: { codeMateriel, designation: input.designation },
    });

    auditLogger.fireAndForget({
      utilisateurId: userId,
      action: AuditAction.CREATION,
      categorie: AuditCategorie.MATERIEL,
      description: `Création matériel ${codeMateriel}`,
      entiteType: 'MATERIEL',
      entiteId: created.id,
    });

    return this.mapToResponse(created, true);
  }

  async update(
    id: number,
    input: UpdateMaterielInput,
    userId: number,
  ): Promise<MaterielResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Matériel introuvable');

    if (input.categorieId !== undefined) {
      const exists = await this.repository.categorieExists(input.categorieId);
      if (!exists) throw AppError.notFound('Catégorie introuvable ou inactive');
    }

    if (input.serviceId !== undefined && input.serviceId !== null) {
      const exists = await this.repository.serviceExists(input.serviceId);
      if (!exists) throw AppError.notFound('Service introuvable ou inactif');
    }

    if (input.numeroSerie && input.numeroSerie !== existing.numeroSerie) {
      await this.ensureUniqueNumeroSerie(input.numeroSerie, id);
    }

    const updated = await this.repository.update(id, input);
    if (!updated) throw AppError.notFound('Matériel introuvable');

    if (input.statut && input.statut !== existing.statut) {
      await this.repository.addHistorique({
        materielId: id,
        utilisateurId: userId,
        action: MaterielHistoriqueAction.CHANGEMENT_STATUT,
        description: `Statut modifié : ${existing.statut} → ${input.statut}`,
        ancienneValeur: { statut: existing.statut },
        nouvelleValeur: { statut: input.statut },
      });
    } else if (input.etat && input.etat !== existing.etat) {
      await this.repository.addHistorique({
        materielId: id,
        utilisateurId: userId,
        action: MaterielHistoriqueAction.CHANGEMENT_ETAT,
        description: `État modifié : ${existing.etat} → ${input.etat}`,
        ancienneValeur: { etat: existing.etat },
        nouvelleValeur: { etat: input.etat },
      });
    } else {
      await this.repository.addHistorique({
        materielId: id,
        utilisateurId: userId,
        action: MaterielHistoriqueAction.MODIFICATION,
        description: `Mise à jour du matériel ${existing.codeMateriel}`,
      });
    }

    auditLogger.fireAndForget({
      utilisateurId: userId,
      action: AuditAction.MODIFICATION,
      categorie: AuditCategorie.MATERIEL,
      description: `Modification matériel ${existing.codeMateriel}`,
      entiteType: 'MATERIEL',
      entiteId: id,
    });

    return this.mapToResponse(updated, true);
  }

  async deactivate(id: number, userId: number): Promise<MaterielResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw AppError.notFound('Matériel introuvable');
    if (!existing.actif) throw AppError.badRequest('Matériel déjà désactivé');

    const updated = await this.repository.setActif(id, false);
    if (!updated) throw AppError.notFound('Matériel introuvable');

    await this.repository.addHistorique({
      materielId: id,
      utilisateurId: userId,
      action: MaterielHistoriqueAction.DESACTIVATION,
      description: `Désactivation du matériel ${existing.codeMateriel}`,
    });

    auditLogger.fireAndForget({
      utilisateurId: userId,
      action: AuditAction.SUPPRESSION,
      categorie: AuditCategorie.MATERIEL,
      description: `Désactivation matériel ${existing.codeMateriel}`,
      entiteType: 'MATERIEL',
      entiteId: id,
    });

    return this.mapToResponse(updated, true);
  }

  async getHistorique(id: number): Promise<MaterielHistoriqueResponse[]> {
    const materiel = await this.repository.findById(id);
    if (!materiel) throw AppError.notFound('Matériel introuvable');
    return this.repository.getHistorique(id);
  }

  async getQrCode(id: number): Promise<QrCodeResponse> {
    const materiel = await this.repository.findById(id);
    if (!materiel) throw AppError.notFound('Matériel introuvable');

    const qrCodeDataUrl = await generateMaterielQrCode(materiel.codeMateriel);
    return { codeMateriel: materiel.codeMateriel, qrCodeDataUrl };
  }

  async addImage(
    materielId: number,
    file: Express.Multer.File,
    userId: number,
    isPrincipal = false,
  ): Promise<MaterielResponse> {
    const materiel = await this.repository.findById(materielId);
    if (!materiel) throw AppError.notFound('Matériel introuvable');

    if (isPrincipal) {
      await this.repository.clearPrincipalImage(materielId);
    }

    const existingImages = await this.repository.getImages(materielId);
    const shouldBePrincipal = isPrincipal || existingImages.length === 0;

    await this.repository.addImage({
      materielId,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      isPrincipal: shouldBePrincipal,
    });

    await this.repository.addHistorique({
      materielId,
      utilisateurId: userId,
      action: MaterielHistoriqueAction.AJOUT_IMAGE,
      description: `Ajout de l'image ${file.originalname}`,
    });

    return this.getById(materielId);
  }

  async deleteImage(
    materielId: number,
    imageId: number,
    userId: number,
  ): Promise<MaterielResponse> {
    const image = await this.repository.findImageById(imageId, materielId);
    if (!image) throw AppError.notFound('Image introuvable');

    await this.repository.deleteImage(imageId);
    deleteMaterielImageFile(image.filename);

    await this.repository.addHistorique({
      materielId,
      utilisateurId: userId,
      action: MaterielHistoriqueAction.SUPPRESSION_IMAGE,
      description: `Suppression de l'image ${image.filename}`,
    });

    auditLogger.fireAndForget({
      utilisateurId: userId,
      action: AuditAction.SUPPRESSION,
      categorie: AuditCategorie.MATERIEL,
      description: `Suppression image matériel #${materielId}`,
      entiteType: 'MATERIEL',
      entiteId: materielId,
      metadonnees: { imageId },
    });

    return this.getById(materielId);
  }

  private async validateReferences(
    categorieId: number,
    serviceId?: number | null,
  ): Promise<void> {
    const categorieExists = await this.repository.categorieExists(categorieId);
    if (!categorieExists) throw AppError.notFound('Catégorie introuvable ou inactive');

    if (serviceId) {
      const serviceExists = await this.repository.serviceExists(serviceId);
      if (!serviceExists) throw AppError.notFound('Service introuvable ou inactif');
    }
  }

  private async ensureUniqueNumeroSerie(
    numeroSerie: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.repository.findByNumeroSerie(numeroSerie);
    if (existing && existing.id !== excludeId) {
      throw AppError.conflict('Un matériel avec ce numéro de série existe déjà');
    }
  }

  private computeGarantieInfo(dateFinGarantie: string | null) {
    if (!dateFinGarantie) {
      return { garantieExpiree: false, garantieExpireBientot: false };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fin = new Date(dateFinGarantie);
    fin.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((fin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      garantieExpiree: diffDays < 0,
      garantieExpireBientot: diffDays >= 0 && diffDays <= 30,
    };
  }

  private async mapToResponse(
    row: MaterielRow,
    withImages: boolean,
  ): Promise<MaterielResponse> {
    const garantie = this.computeGarantieInfo(row.dateFinGarantie);

    let images: MaterielResponse['images'] = [];
    if (withImages) {
      const imageRows = await this.repository.getImages(row.id);
      images = imageRows.map((img) => ({
        id: img.id,
        url: getMaterielImageUrl(img.filename),
        originalName: img.originalName,
        mimeType: img.mimeType,
        size: img.size,
        isPrincipal: img.isPrincipal,
        createdAt: img.createdAt,
      }));
    }

    return {
      id: row.id,
      codeMateriel: row.codeMateriel,
      numeroSerie: row.numeroSerie,
      designation: row.designation,
      marque: row.marque,
      modele: row.modele,
      categorie: {
        id: row.categorieId,
        code: row.categorieCode,
        libelle: row.categorieLibelle,
      },
      service: row.serviceId
        ? {
            id: row.serviceId,
            code: row.serviceCode!,
            libelle: row.serviceLibelle!,
          }
        : null,
      localisation: row.localisation,
      dateAcquisition: row.dateAcquisition,
      dateFinGarantie: row.dateFinGarantie,
      garantieExpiree: garantie.garantieExpiree,
      garantieExpireBientot: garantie.garantieExpireBientot,
      statut: row.statut as MaterielStatut,
      etat: row.etat as MaterielEtat,
      description: row.description,
      actif: row.actif,
      images,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

export const materielsService = new MaterielsService();
