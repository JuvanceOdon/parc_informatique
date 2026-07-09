import type {
  CategorieFilters,
  CategorieListQuery,
  CategorieResponse,
  CategorieRow,
  CreateCategorieInput,
  UpdateCategorieInput,
} from './categories.types.js';

export interface ICategoriesRepository {
  findAll(
    query: CategorieListQuery,
    filters: CategorieFilters,
  ): Promise<{ rows: CategorieRow[]; total: number }>;
  findById(id: number): Promise<CategorieRow | null>;
  findByCode(code: string): Promise<CategorieRow | null>;
  create(data: CreateCategorieInput): Promise<CategorieRow>;
  update(id: number, data: UpdateCategorieInput): Promise<CategorieRow | null>;
  delete(id: number): Promise<boolean>;
}

export interface ICategoriesService {
  list(query: CategorieListQuery, filters: CategorieFilters): Promise<{
    data: CategorieResponse[];
    total: number;
  }>;
  getById(id: number): Promise<CategorieResponse>;
  create(input: CreateCategorieInput): Promise<CategorieResponse>;
  update(id: number, input: UpdateCategorieInput): Promise<CategorieResponse>;
  delete(id: number): Promise<void>;
}
