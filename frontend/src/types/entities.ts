export interface LookupItem {
  id: number;
  label: string;
}

export interface Categorie {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  actif: boolean;
}

export interface Service {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  actif: boolean;
}

export interface UtilisateurSummary {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface Materiel {
  id: number;
  codeMateriel: string;
  numeroSerie: string | null;
  designation: string;
  marque: string | null;
  modele: string | null;
  categorie: { id: number; code: string; libelle: string };
  service: { id: number; code: string; libelle: string } | null;
  localisation: string | null;
  dateAcquisition: string | null;
  dateFinGarantie: string | null;
  garantieExpiree: boolean;
  garantieExpireBientot: boolean;
  statut: string;
  etat: string;
  description: string | null;
  actif: boolean;
  images: Array<{
    id: number;
    url: string;
    originalName: string;
    mimeType: string;
    size: number;
    isPrincipal: boolean;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface MaterielHistoriqueEntry {
  id: number;
  action: string;
  description: string | null;
  ancienneValeur: Record<string, unknown> | null;
  nouvelleValeur: Record<string, unknown> | null;
  utilisateur: { id: number; nom: string; prenom: string; matricule: string } | null;
  createdAt: string;
}

export interface TicketDetail {
  id: number;
  numeroTicket: string;
  titre: string;
  description: string;
  materiel: { id: number; codeMateriel: string; designation: string; numeroSerie: string | null } | null;
  demandeur: UtilisateurSummary;
  assignee: UtilisateurSummary | null;
  service: { id: number; code: string; libelle: string } | null;
  priorite: string;
  statut: string;
  dateResolution: string | null;
  dateFermeture: string | null;
  commentairesCount: number;
  piecesJointesCount: number;
  createdAt: string;
  updatedAt: string;
  commentaires: Array<{
    id: number;
    contenu: string;
    utilisateur: UtilisateurSummary;
    createdAt: string;
  }>;
  piecesJointes: Array<{
    id: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedBy: UtilisateurSummary;
    createdAt: string;
  }>;
}

export interface TicketHistoriqueEntry {
  id: number;
  action: string;
  description: string | null;
  ancienneValeur: string | null;
  nouvelleValeur: string | null;
  utilisateur: UtilisateurSummary | null;
  createdAt: string;
}

export interface Affectation {
  id: number;
  statut: string;
  dateDebut: string;
  dateFin: string | null;
  localisation: string | null;
  motif: string | null;
  materiel?: { id: number; codeMateriel: string; designation: string };
  utilisateur?: UtilisateurSummary;
  service?: { id: number; libelle: string };
}

export interface Maintenance {
  id: number;
  numeroMaintenance: string;
  titre: string;
  type: string;
  statut: string;
  description: string | null;
  diagnostic: string | null;
  solution: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  datePlanifiee: string | null;
  cout: number | null;
  materiel?: { id: number; codeMateriel: string; designation: string };
  technicien?: UtilisateurSummary | null;
  ticket?: { id: number; numeroTicket: string } | null;
}

export interface MaterielFormData {
  numeroSerie: string;
  designation: string;
  marque: string;
  modele: string;
  categorieId: number | '';
  serviceId: number | '';
  localisation: string;
  dateAcquisition: string;
  dateFinGarantie: string;
  statut: string;
  etat: string;
  description: string;
}

export interface AffectationFormData {
  materielId: number | '';
  utilisateurId: number | '';
  serviceId: number | '';
  localisation: string;
  motif: string;
}

export interface MaintenanceFormData {
  materielId: number | '';
  ticketId: number | '';
  type: string;
  titre: string;
  description: string;
  diagnostic: string;
  technicienId: number | '';
  datePlanifiee: string;
  cout: string;
  demarrer: boolean;
}
