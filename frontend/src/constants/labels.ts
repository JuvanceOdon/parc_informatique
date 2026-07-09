export const TICKET_PRIORITE_LABELS: Record<string, string> = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique',
};

export const TICKET_STATUT_LABELS: Record<string, string> = {
  OUVERT: 'Ouvert',
  EN_COURS: 'En cours',
  EN_ATTENTE: 'En attente',
  RESOLU: 'Résolu',
  FERME: 'Fermé',
  ANNULE: 'Annulé',
};

export const MATERIEL_STATUT_LABELS: Record<string, string> = {
  EN_STOCK: 'En stock',
  EN_SERVICE: 'En service',
  EN_MAINTENANCE: 'En maintenance',
  HORS_SERVICE: 'Hors service',
  REFORME: 'Réformé',
};

export const MATERIEL_ETAT_LABELS: Record<string, string> = {
  NEUF: 'Neuf',
  BON: 'Bon',
  MOYEN: 'Moyen',
  MAUVAIS: 'Mauvais',
};

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  PREVENTIVE: 'Préventive',
  CORRECTIVE: 'Corrective',
};

export const MAINTENANCE_STATUT_LABELS: Record<string, string> = {
  PLANIFIEE: 'Planifiée',
  EN_COURS: 'En cours',
  DIAGNOSTIC: 'Diagnostic',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

export const MAINTENANCE_STATUT_TRANSITIONS: Record<string, string[]> = {
  PLANIFIEE: ['EN_COURS', 'ANNULEE'],
  EN_COURS: ['DIAGNOSTIC', 'TERMINEE', 'ANNULEE'],
  DIAGNOSTIC: ['EN_COURS', 'TERMINEE', 'ANNULEE'],
  TERMINEE: [],
  ANNULEE: [],
};

export const isMaintenanceTerminal = (statut: string): boolean =>
  statut === 'TERMINEE' || statut === 'ANNULEE';

export const AFFECTATION_STATUT_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  TERMINEE: 'Terminée',
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  CHEF_SERVICE: 'Chef de service',
  TECHNICIEN: 'Technicien',
  UTILISATEUR: 'Utilisateur',
};

export const MATERIEL_HISTORIQUE_LABELS: Record<string, string> = {
  CREATION: 'Création',
  MODIFICATION: 'Modification',
  CHANGEMENT_STATUT: 'Changement de statut',
  CHANGEMENT_ETAT: 'Changement d\'état',
  AJOUT_IMAGE: 'Ajout d\'image',
  SUPPRESSION_IMAGE: 'Suppression d\'image',
  DESACTIVATION: 'Désactivation',
  ACTIVATION: 'Activation',
  MAINTENANCE: 'Maintenance',
};

export const TICKET_HISTORIQUE_LABELS: Record<string, string> = {
  CREATION: 'Création',
  MODIFICATION: 'Modification',
  CHANGEMENT_STATUT: 'Changement de statut',
  CHANGEMENT_PRIORITE: 'Changement de priorité',
  ASSIGNATION: 'Assignation',
  COMMENTAIRE: 'Commentaire',
  PIECE_JOINTE_AJOUT: 'Pièce jointe ajoutée',
  PIECE_JOINTE_SUPPRESSION: 'Pièce jointe supprimée',
};
