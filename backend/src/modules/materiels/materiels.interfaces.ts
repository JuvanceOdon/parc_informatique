import type {
  CreateMaterielInput,
  MaterielFilters,
  MaterielHistoriqueResponse,
  MaterielListQuery,
  MaterielRow,
  UpdateMaterielInput,
} from './materiels.types.js';
import type { MaterielHistoriqueAction } from '../../shared/constants/materiel.constants.js';

export interface IMaterielsRepository {
  findAll(
    query: MaterielListQuery,
    filters: MaterielFilters,
  ): Promise<{ rows: MaterielRow[]; total: number }>;
  findById(id: number): Promise<MaterielRow | null>;
  findByCode(codeMateriel: string): Promise<MaterielRow | null>;
  findByNumeroSerie(numeroSerie: string): Promise<MaterielRow | null>;
  generateNextCode(): Promise<string>;
  create(data: CreateMaterielInput & { codeMateriel: string }): Promise<MaterielRow>;
  update(id: number, data: UpdateMaterielInput): Promise<MaterielRow | null>;
  setActif(id: number, actif: boolean): Promise<MaterielRow | null>;
  categorieExists(id: number): Promise<boolean>;
  serviceExists(id: number): Promise<boolean>;
  addHistorique(data: {
    materielId: number;
    utilisateurId: number | null;
    action: MaterielHistoriqueAction;
    description?: string;
    ancienneValeur?: Record<string, unknown> | null;
    nouvelleValeur?: Record<string, unknown> | null;
  }): Promise<void>;
  getHistorique(materielId: number): Promise<MaterielHistoriqueResponse[]>;
  getImages(materielId: number): Promise<Array<{
    id: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    isPrincipal: boolean;
    createdAt: Date;
  }>>;
  addImage(data: {
    materielId: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    isPrincipal: boolean;
  }): Promise<number>;
  findImageById(imageId: number, materielId: number): Promise<{
    id: number;
    filename: string;
  } | null>;
  deleteImage(imageId: number): Promise<boolean>;
  clearPrincipalImage(materielId: number): Promise<void>;
}
