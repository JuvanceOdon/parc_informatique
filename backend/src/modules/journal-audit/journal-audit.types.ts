import type {
  AuditAction,
  AuditCategorie,
  AuditExportFormat,
} from '../../shared/constants/audit.constants.js';

export interface JournalAuditResponse {
  id: number;
  utilisateur: {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    email: string;
  } | null;
  action: AuditAction;
  categorie: AuditCategorie;
  description: string;
  entiteType: string | null;
  entiteId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadonnees: Record<string, unknown> | null;
  createdAt: Date;
}

export interface JournalAuditListQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface JournalAuditFilters {
  action?: AuditAction;
  categorie?: AuditCategorie;
  utilisateurId?: number;
  dateDebut?: Date;
  dateFin?: Date;
  search?: string;
}

export interface CreateJournalAuditInput {
  utilisateurId?: number | null;
  action: AuditAction;
  categorie: AuditCategorie;
  description: string;
  entiteType?: string | null;
  entiteId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadonnees?: Record<string, unknown> | null;
}

export interface JournalAuditRow {
  id: number;
  utilisateurId: number | null;
  utilisateurMatricule: string | null;
  utilisateurNom: string | null;
  utilisateurPrenom: string | null;
  utilisateurEmail: string | null;
  action: string;
  categorie: string;
  description: string;
  entiteType: string | null;
  entiteId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadonnees: unknown;
  createdAt: Date;
}

export interface JournalAuditExportQuery {
  format: AuditExportFormat;
  action?: AuditAction;
  categorie?: AuditCategorie;
  utilisateurId?: number;
  dateDebut?: string;
  dateFin?: string;
  search?: string;
}

export interface JournalAuditExportResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}
