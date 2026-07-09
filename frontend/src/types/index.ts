export type RoleCode = 'ADMIN' | 'CHEF_SERVICE' | 'TECHNICIEN' | 'UTILISATEUR';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp?: string;
}

export interface User {
  id: number;
  matricule: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  role: {
    id: number;
    code: RoleCode;
    libelle: string;
  };
  serviceId: number | null;
  actif: boolean;
  derniereConnexion: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ChartPoint {
  label: string;
  value: number;
  code?: string;
}

export interface DashboardData {
  kpi: {
    totalMateriels: number;
    materielsEnService: number;
    materielsEnStock: number;
    materielsEnMaintenance: number;
    tauxDisponibilite: number;
    ticketsOuverts: number;
    ticketsEnCours: number;
    maintenancesEnCours: number;
    affectationsActives: number;
    utilisateursActifs: number;
    garantiesExpirant30Jours: number;
  };
  repartitionMateriels: {
    parStatut: ChartPoint[];
    parCategorie: ChartPoint[];
  };
  repartitionTickets: {
    parStatut: ChartPoint[];
    parPriorite: ChartPoint[];
  };
  interventionsMensuelles: Array<{
    mois: string;
    label: string;
    preventive: number;
    corrective: number;
    total: number;
  }>;
  graphiques: {
    ticketsParMois: Array<{
      mois: string;
      label: string;
      crees: number;
      resolus: number;
      fermes: number;
    }>;
  };
}

export interface Notification {
  id: number;
  type: string;
  titre: string;
  message: string;
  lu: boolean;
  createdAt: string;
}
