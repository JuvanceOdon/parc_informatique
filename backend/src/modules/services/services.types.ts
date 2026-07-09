export interface ResponsableSummary {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface ServiceResponse {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  responsable: ResponsableSummary | null;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceListQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  actif?: boolean;
}

export interface ServiceFilters {
  search?: string;
  actif?: boolean;
}

export interface CreateServiceInput {
  code: string;
  libelle: string;
  description?: string | null;
  responsableId?: number | null;
}

export interface UpdateServiceInput {
  code?: string;
  libelle?: string;
  description?: string | null;
  responsableId?: number | null;
}

export interface ServiceRow {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  responsableId: number | null;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
  responsableMatricule: string | null;
  responsableNom: string | null;
  responsablePrenom: string | null;
  responsableEmail: string | null;
}
