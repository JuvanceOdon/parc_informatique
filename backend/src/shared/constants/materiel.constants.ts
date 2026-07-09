export enum MaterielStatut {
  EN_STOCK = 'EN_STOCK',
  EN_SERVICE = 'EN_SERVICE',
  EN_MAINTENANCE = 'EN_MAINTENANCE',
  HORS_SERVICE = 'HORS_SERVICE',
  REFORME = 'REFORME',
}

export enum MaterielEtat {
  NEUF = 'NEUF',
  BON = 'BON',
  MOYEN = 'MOYEN',
  MAUVAIS = 'MAUVAIS',
}

export enum MaterielHistoriqueAction {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  CHANGEMENT_STATUT = 'CHANGEMENT_STATUT',
  CHANGEMENT_ETAT = 'CHANGEMENT_ETAT',
  AJOUT_IMAGE = 'AJOUT_IMAGE',
  SUPPRESSION_IMAGE = 'SUPPRESSION_IMAGE',
  DESACTIVATION = 'DESACTIVATION',
  ACTIVATION = 'ACTIVATION',
  MAINTENANCE = 'MAINTENANCE',
}

export const MATERIEL_STATUTS = Object.values(MaterielStatut);
export const MATERIEL_ETATS = Object.values(MaterielEtat);

export const MATERIEL_STATUT_LABELS: Record<MaterielStatut, string> = {
  [MaterielStatut.EN_STOCK]: 'En stock',
  [MaterielStatut.EN_SERVICE]: 'En service',
  [MaterielStatut.EN_MAINTENANCE]: 'En maintenance',
  [MaterielStatut.HORS_SERVICE]: 'Hors service',
  [MaterielStatut.REFORME]: 'Réformé',
};

export const MATERIEL_ETAT_LABELS: Record<MaterielEtat, string> = {
  [MaterielEtat.NEUF]: 'Neuf',
  [MaterielEtat.BON]: 'Bon',
  [MaterielEtat.MOYEN]: 'Moyen',
  [MaterielEtat.MAUVAIS]: 'Mauvais',
};
