import type {
  CreateServiceInput,
  ServiceFilters,
  ServiceListQuery,
  ServiceResponse,
  ServiceRow,
  UpdateServiceInput,
} from './services.types.js';

export interface IServicesRepository {
  findAll(
    query: ServiceListQuery,
    filters: ServiceFilters,
  ): Promise<{ rows: ServiceRow[]; total: number }>;
  findById(id: number): Promise<ServiceRow | null>;
  findByCode(code: string): Promise<ServiceRow | null>;
  create(data: CreateServiceInput): Promise<ServiceRow>;
  update(id: number, data: UpdateServiceInput): Promise<ServiceRow | null>;
  setActif(id: number, actif: boolean): Promise<ServiceRow | null>;
  assignResponsable(id: number, responsableId: number | null): Promise<ServiceRow | null>;
  countUsersInService(serviceId: number): Promise<number>;
}

export interface IServicesService {
  list(query: ServiceListQuery, filters: ServiceFilters): Promise<{
    data: ServiceResponse[];
    total: number;
  }>;
  getById(id: number): Promise<ServiceResponse>;
  create(input: CreateServiceInput): Promise<ServiceResponse>;
  update(id: number, input: UpdateServiceInput): Promise<ServiceResponse>;
  deactivate(id: number): Promise<ServiceResponse>;
  activate(id: number): Promise<ServiceResponse>;
  assignResponsable(serviceId: number, responsableId: number): Promise<ServiceResponse>;
  removeResponsable(serviceId: number): Promise<ServiceResponse>;
}
