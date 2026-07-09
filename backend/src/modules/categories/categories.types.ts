export interface CategorieResponse {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategorieListQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  actif?: boolean;
}

export interface CategorieFilters {
  search?: string;
  actif?: boolean;
}

export interface CreateCategorieInput {
  code: string;
  libelle: string;
  description?: string | null;
}

export interface UpdateCategorieInput {
  code?: string;
  libelle?: string;
  description?: string | null;
  actif?: boolean;
}

export type CategorieRow = CategorieResponse;
