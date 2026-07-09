import { AppError } from '../../shared/errors/index.js';
import type { ICategoriesRepository } from './categories.interfaces.js';
import type {
  CategorieFilters,
  CategorieListQuery,
  CategorieResponse,
  CreateCategorieInput,
  UpdateCategorieInput,
} from './categories.types.js';
import { categoriesRepository } from './categories.repository.js';

export class CategoriesService {
  constructor(
    private readonly repository: ICategoriesRepository = categoriesRepository,
  ) {}

  async list(
    query: CategorieListQuery,
    filters: CategorieFilters,
  ): Promise<{ data: CategorieResponse[]; total: number }> {
    const { rows, total } = await this.repository.findAll(query, filters);

    return { data: rows, total };
  }

  async getById(id: number): Promise<CategorieResponse> {
    const categorie = await this.repository.findById(id);

    if (!categorie) {
      throw AppError.notFound('Catégorie introuvable');
    }

    return categorie;
  }

  async create(input: CreateCategorieInput): Promise<CategorieResponse> {
    await this.ensureUniqueCode(input.code);
    return this.repository.create(input);
  }

  async update(id: number, input: UpdateCategorieInput): Promise<CategorieResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('Catégorie introuvable');
    }

    if (input.code && input.code.toUpperCase() !== existing.code) {
      await this.ensureUniqueCode(input.code, id);
    }

    const updated = await this.repository.update(id, input);

    if (!updated) {
      throw AppError.notFound('Catégorie introuvable');
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('Catégorie introuvable');
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw AppError.notFound('Catégorie introuvable');
    }
  }

  private async ensureUniqueCode(code: string, excludeId?: number): Promise<void> {
    const existing = await this.repository.findByCode(code);

    if (existing && existing.id !== excludeId) {
      throw AppError.conflict('Une catégorie avec ce code existe déjà');
    }
  }
}

export const categoriesService = new CategoriesService();
