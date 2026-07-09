import { RapportType, type RapportPeriode } from './rapports.types.js';

const MOIS_LABELS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export const buildMensuelPeriode = (annee: number, mois: number): RapportPeriode => ({
  type: RapportType.MENSUEL,
  annee,
  mois,
  label: `${MOIS_LABELS[mois - 1]} ${annee}`,
  dateDebut: new Date(annee, mois - 1, 1, 0, 0, 0, 0),
  dateFin: new Date(annee, mois, 0, 23, 59, 59, 999),
});

export const buildAnnuelPeriode = (annee: number): RapportPeriode => ({
  type: RapportType.ANNUEL,
  annee,
  label: `Année ${annee}`,
  dateDebut: new Date(annee, 0, 1, 0, 0, 0, 0),
  dateFin: new Date(annee, 11, 31, 23, 59, 59, 999),
});
