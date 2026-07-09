import type {
  CreateUtilisateurInput,
  UpdateUtilisateurInput,
  UtilisateurFilters,
  UtilisateurListQuery,
  UtilisateurResponse,
  UtilisateurRow,
} from './utilisateurs.types.js';

export interface IUtilisateursRepository {
  findAll(
    query: UtilisateurListQuery,
    filters: UtilisateurFilters,
  ): Promise<{ rows: UtilisateurRow[]; total: number }>;
  findById(id: number): Promise<UtilisateurRow | null>;
  findByEmail(email: string): Promise<UtilisateurRow | null>;
  findByMatricule(matricule: string): Promise<UtilisateurRow | null>;
  create(data: CreateUtilisateurInput & { motDePasse: string }): Promise<UtilisateurRow>;
  update(id: number, data: UpdateUtilisateurInput & { motDePasse?: string }): Promise<UtilisateurRow | null>;
  setActif(id: number, actif: boolean): Promise<UtilisateurRow | null>;
  countAdmins(): Promise<number>;
  roleExists(roleId: number): Promise<boolean>;
}

export interface IUtilisateursService {
  list(query: UtilisateurListQuery, filters: UtilisateurFilters): Promise<{
    data: UtilisateurResponse[];
    total: number;
  }>;
  getById(id: number): Promise<UtilisateurResponse>;
  create(input: CreateUtilisateurInput): Promise<UtilisateurResponse>;
  update(id: number, input: UpdateUtilisateurInput, currentUserId: number): Promise<UtilisateurResponse>;
  deactivate(id: number, currentUserId: number): Promise<UtilisateurResponse>;
  activate(id: number): Promise<UtilisateurResponse>;
  assignRole(id: number, roleId: number, currentUserId: number): Promise<UtilisateurResponse>;
}
