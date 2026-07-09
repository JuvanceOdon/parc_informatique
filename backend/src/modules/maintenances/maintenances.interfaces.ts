import type {
  AddHistoriqueInput,
  CreateMaintenanceInput,
  MaintenanceFilters,
  MaintenanceHistoriqueRow,
  MaintenanceListQuery,
  MaintenanceRow,
  UpdateMaintenanceInput,
} from './maintenances.types.js';
import type {
  MaintenanceStatut,
} from '../../shared/constants/maintenance.constants.js';
import type { MaterielEtat, MaterielStatut } from '../../shared/constants/materiel.constants.js';

export interface IMaintenancesRepository {
  findAll(
    query: MaintenanceListQuery,
    filters: MaintenanceFilters,
  ): Promise<{ rows: MaintenanceRow[]; total: number }>;
  findById(id: number): Promise<MaintenanceRow | null>;
  findActiveByMaterielId(materielId: number): Promise<MaintenanceRow | null>;
  findByMaterielId(materielId: number): Promise<MaintenanceRow[]>;
  generateNextCode(): Promise<string>;
  create(data: CreateMaintenanceInput & {
    numeroMaintenance: string;
    createdById: number;
    statut: MaintenanceStatut;
    statutMaterielAvant?: MaterielStatut | null;
    etatMaterielAvant?: MaterielEtat | null;
    dateDebut?: Date | null;
  }): Promise<MaintenanceRow>;
  update(id: number, data: UpdateMaintenanceInput): Promise<MaintenanceRow | null>;
  delete(id: number): Promise<boolean>;
  updateStatut(
    id: number,
    statut: MaintenanceStatut,
    dates: { dateDebut?: Date | null; dateFin?: Date | null },
  ): Promise<MaintenanceRow | null>;
  updateStatutWithSnapshots(
    id: number,
    statut: MaintenanceStatut,
    data: {
      dateDebut?: Date | null;
      dateFin?: Date | null;
      statutMaterielAvant: MaterielStatut;
      etatMaterielAvant: MaterielEtat;
    },
  ): Promise<MaintenanceRow | null>;
  updateDiagnostic(id: number, diagnostic: string): Promise<MaintenanceRow | null>;
  updateSolution(
    id: number,
    data: {
      solution: string;
      statutMaterielApres: MaterielStatut;
      etatMaterielApres: MaterielEtat;
      cout?: string | null;
      dateFin: Date;
    },
  ): Promise<MaintenanceRow | null>;
  addHistorique(data: AddHistoriqueInput): Promise<void>;
  getHistorique(maintenanceId: number): Promise<MaintenanceHistoriqueRow[]>;
  materielExists(id: number): Promise<{ statut: string; etat: string } | null>;
  ticketExists(id: number): Promise<boolean>;
  technicienExists(id: number): Promise<boolean>;
  hasActiveAffectation(materielId: number): Promise<boolean>;
}
