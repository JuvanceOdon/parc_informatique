export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
}

export enum MaintenanceStatut {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  DIAGNOSTIC = 'DIAGNOSTIC',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export enum MaintenanceHistoriqueAction {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  DEMARRAGE = 'DEMARRAGE',
  DIAGNOSTIC = 'DIAGNOSTIC',
  SOLUTION = 'SOLUTION',
  ANNULATION = 'ANNULATION',
  CHANGEMENT_ETAT_MATERIEL = 'CHANGEMENT_ETAT_MATERIEL',
}

export const MAINTENANCE_TYPES = Object.values(MaintenanceType);
export const MAINTENANCE_STATUTS = Object.values(MaintenanceStatut);

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  [MaintenanceType.PREVENTIVE]: 'Préventive',
  [MaintenanceType.CORRECTIVE]: 'Corrective',
};

export const MAINTENANCE_STATUT_LABELS: Record<MaintenanceStatut, string> = {
  [MaintenanceStatut.PLANIFIEE]: 'Planifiée',
  [MaintenanceStatut.EN_COURS]: 'En cours',
  [MaintenanceStatut.DIAGNOSTIC]: 'Diagnostic',
  [MaintenanceStatut.TERMINEE]: 'Terminée',
  [MaintenanceStatut.ANNULEE]: 'Annulée',
};

const ACTIVE_STATUTS = new Set<MaintenanceStatut>([
  MaintenanceStatut.PLANIFIEE,
  MaintenanceStatut.EN_COURS,
  MaintenanceStatut.DIAGNOSTIC,
]);

export const isMaintenanceActive = (statut: MaintenanceStatut): boolean =>
  ACTIVE_STATUTS.has(statut);

const TERMINAL_STATUTS = new Set<MaintenanceStatut>([
  MaintenanceStatut.TERMINEE,
  MaintenanceStatut.ANNULEE,
]);

export const isMaintenanceTerminal = (statut: MaintenanceStatut): boolean =>
  TERMINAL_STATUTS.has(statut);

export const MAINTENANCE_STATUT_TRANSITIONS: Record<MaintenanceStatut, MaintenanceStatut[]> = {
  [MaintenanceStatut.PLANIFIEE]: [MaintenanceStatut.EN_COURS, MaintenanceStatut.ANNULEE],
  [MaintenanceStatut.EN_COURS]: [
    MaintenanceStatut.DIAGNOSTIC,
    MaintenanceStatut.TERMINEE,
    MaintenanceStatut.ANNULEE,
  ],
  [MaintenanceStatut.DIAGNOSTIC]: [
    MaintenanceStatut.EN_COURS,
    MaintenanceStatut.TERMINEE,
    MaintenanceStatut.ANNULEE,
  ],
  [MaintenanceStatut.TERMINEE]: [],
  [MaintenanceStatut.ANNULEE]: [],
};

export const canTransitionMaintenanceStatut = (
  from: MaintenanceStatut,
  to: MaintenanceStatut,
): boolean => MAINTENANCE_STATUT_TRANSITIONS[from]?.includes(to) ?? false;
