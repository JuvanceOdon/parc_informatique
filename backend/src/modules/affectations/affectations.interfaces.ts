import type {
  AffectationFilters,
  AffectationListQuery,
  AffectationRow,
  CreateAffectationInput,
  UpdateAffectationInput,
} from './affectations.types.js';
import type { AffectationStatut } from '../../shared/constants/affectation.constants.js';

export interface IAffectationsRepository {
  findAll(
    query: AffectationListQuery,
    filters: AffectationFilters,
  ): Promise<{ rows: AffectationRow[]; total: number }>;
  findById(id: number): Promise<AffectationRow | null>;
  findActiveByMaterielId(materielId: number): Promise<AffectationRow | null>;
  findByMaterielId(materielId: number): Promise<AffectationRow[]>;
  findByUtilisateurId(utilisateurId: number): Promise<AffectationRow[]>;
  create(data: CreateAffectationInput & {
    affecteParId: number;
    serviceId: number | null;
  }): Promise<AffectationRow>;
  closeAffectation(
    id: number,
    statut: AffectationStatut,
    motif?: string | null,
  ): Promise<AffectationRow | null>;
  update(id: number, data: UpdateAffectationInput): Promise<AffectationRow | null>;
}
