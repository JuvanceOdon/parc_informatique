export enum AffectationStatut {
  ACTIVE = 'ACTIVE',
  TERMINEE = 'TERMINEE',
  TRANSFEREE = 'TRANSFEREE',
}

export const AFFECTATION_STATUTS = Object.values(AffectationStatut);

export const AFFECTATION_STATUT_LABELS: Record<AffectationStatut, string> = {
  [AffectationStatut.ACTIVE]: 'Active',
  [AffectationStatut.TERMINEE]: 'Terminée',
  [AffectationStatut.TRANSFEREE]: 'Transférée',
};
