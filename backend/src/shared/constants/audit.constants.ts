export enum AuditAction {
  CONNEXION = 'CONNEXION',
  DECONNEXION = 'DECONNEXION',
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  SUPPRESSION = 'SUPPRESSION',
  EXPORT = 'EXPORT',
}

export enum AuditCategorie {
  AUTH = 'AUTH',
  UTILISATEUR = 'UTILISATEUR',
  SERVICE = 'SERVICE',
  CATEGORIE = 'CATEGORIE',
  MATERIEL = 'MATERIEL',
  AFFECTATION = 'AFFECTATION',
  TICKET = 'TICKET',
  MAINTENANCE = 'MAINTENANCE',
  RAPPORT = 'RAPPORT',
  JOURNAL = 'JOURNAL',
}

export enum AuditExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
}

export const AUDIT_ACTIONS = Object.values(AuditAction);
export const AUDIT_CATEGORIES = Object.values(AuditCategorie);

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  [AuditAction.CONNEXION]: 'Connexion',
  [AuditAction.DECONNEXION]: 'Déconnexion',
  [AuditAction.CREATION]: 'Création',
  [AuditAction.MODIFICATION]: 'Modification',
  [AuditAction.SUPPRESSION]: 'Suppression',
  [AuditAction.EXPORT]: 'Export',
};

export const AUDIT_CATEGORIE_LABELS: Record<AuditCategorie, string> = {
  [AuditCategorie.AUTH]: 'Authentification',
  [AuditCategorie.UTILISATEUR]: 'Utilisateur',
  [AuditCategorie.SERVICE]: 'Service',
  [AuditCategorie.CATEGORIE]: 'Catégorie',
  [AuditCategorie.MATERIEL]: 'Matériel',
  [AuditCategorie.AFFECTATION]: 'Affectation',
  [AuditCategorie.TICKET]: 'Ticket',
  [AuditCategorie.MAINTENANCE]: 'Maintenance',
  [AuditCategorie.RAPPORT]: 'Rapport',
  [AuditCategorie.JOURNAL]: 'Journal d\'audit',
};
