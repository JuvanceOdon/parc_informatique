import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { maintenances } from '../../database/schema/maintenances.schema.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { tickets } from '../../database/schema/tickets.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import {
  MaintenanceStatut,
  MaintenanceType,
} from '../../shared/constants/maintenance.constants.js';
import { MaterielEtat, MaterielStatut } from '../../shared/constants/materiel.constants.js';
import { logger } from '../../utils/logger.js';

type DemoMaintenance = {
  numeroMaintenance: string;
  materielCode: string;
  ticketNumero: string | null;
  type: MaintenanceType;
  statut: MaintenanceStatut;
  titre: string;
  description: string;
  diagnostic: string | null;
  solution: string | null;
  technicienMatricule: string;
  createdByMatricule: string;
  cout: string | null;
  daysAgoPlanifiee: number;
  daysAgoDebut: number | null;
  daysAgoFin: number | null;
};

const DEMO_MAINTENANCES: DemoMaintenance[] = [
  {
    numeroMaintenance: 'MNT-2026-0001',
    materielCode: 'IMP-RH-001',
    ticketNumero: 'TKT-2026-0002',
    type: MaintenanceType.CORRECTIVE,
    statut: MaintenanceStatut.EN_COURS,
    titre: 'Remplacement rouleau d\'entraînement imprimante RH',
    description: 'Intervention suite aux bourrages papier récurrents signalés par la RH.',
    diagnostic: 'Rouleau d\'alimentation usé et capteur papier encrassé.',
    solution: null,
    technicienMatricule: 'TECH002',
    createdByMatricule: 'RESP001',
    cout: '85000',
    daysAgoPlanifiee: 1,
    daysAgoDebut: 1,
    daysAgoFin: null,
  },
  {
    numeroMaintenance: 'MNT-2026-0002',
    materielCode: 'SRV-INFO-001',
    ticketNumero: null,
    type: MaintenanceType.PREVENTIVE,
    statut: MaintenanceStatut.PLANIFIEE,
    titre: 'Maintenance préventive serveur PowerEdge',
    description: 'Contrôle ventilateurs, firmware et sauvegardes — planning trimestriel.',
    diagnostic: null,
    solution: null,
    technicienMatricule: 'TECH001',
    createdByMatricule: 'RESP001',
    cout: '0',
    daysAgoPlanifiee: -7,
    daysAgoDebut: null,
    daysAgoFin: null,
  },
  {
    numeroMaintenance: 'MNT-2026-0003',
    materielCode: 'PC-LOG-001',
    ticketNumero: null,
    type: MaintenanceType.CORRECTIVE,
    statut: MaintenanceStatut.TERMINEE,
    titre: 'Nettoyage + remplacement SSD portable logistique',
    description: 'Lenteur extrême au démarrage, disque HDD saturé.',
    diagnostic: 'HDD à 95 % d\'usure SMART, fragmentation élevée.',
    solution: 'Migration des données vers SSD 512 Go et réinstallation du système.',
    technicienMatricule: 'TECH001',
    createdByMatricule: 'ADMIN001',
    cout: '320000',
    daysAgoPlanifiee: 40,
    daysAgoDebut: 38,
    daysAgoFin: 35,
  },
  {
    numeroMaintenance: 'MNT-2026-0004',
    materielCode: 'NET-INFO-001',
    ticketNumero: null,
    type: MaintenanceType.PREVENTIVE,
    statut: MaintenanceStatut.PLANIFIEE,
    titre: 'Mise à jour firmware switch Catalyst',
    description: 'Application du patch de sécurité Cisco recommandé.',
    diagnostic: null,
    solution: null,
    technicienMatricule: 'TECH002',
    createdByMatricule: 'RESP001',
    cout: null,
    daysAgoPlanifiee: -14,
    daysAgoDebut: null,
    daysAgoFin: null,
  },
];

const daysOffset = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export const seedMaintenances = async (): Promise<void> => {
  for (const m of DEMO_MAINTENANCES) {
    const [materiel] = await db
      .select({ id: materiels.id, statut: materiels.statut, etat: materiels.etat })
      .from(materiels)
      .where(eq(materiels.codeMateriel, m.materielCode))
      .limit(1);
    const [technicien] = await db
      .select({ id: utilisateurs.id })
      .from(utilisateurs)
      .where(eq(utilisateurs.matricule, m.technicienMatricule))
      .limit(1);
    const [createdBy] = await db
      .select({ id: utilisateurs.id })
      .from(utilisateurs)
      .where(eq(utilisateurs.matricule, m.createdByMatricule))
      .limit(1);

    if (!materiel || !technicien || !createdBy) {
      throw new Error(`Données manquantes pour maintenance ${m.numeroMaintenance}`);
    }

    let ticketId: number | null = null;
    if (m.ticketNumero) {
      const [ticket] = await db
        .select({ id: tickets.id })
        .from(tickets)
        .where(eq(tickets.numeroTicket, m.ticketNumero))
        .limit(1);
      ticketId = ticket?.id ?? null;
    }

    await db.insert(maintenances).values({
      numeroMaintenance: m.numeroMaintenance,
      materielId: materiel.id,
      ticketId,
      type: m.type,
      statut: m.statut,
      titre: m.titre,
      description: m.description,
      diagnostic: m.diagnostic,
      solution: m.solution,
      technicienId: technicien.id,
      statutMaterielAvant:
        m.statut === MaintenanceStatut.EN_COURS || m.statut === MaintenanceStatut.TERMINEE
          ? (materiel.statut as MaterielStatut)
          : null,
      etatMaterielAvant:
        m.statut === MaintenanceStatut.EN_COURS || m.statut === MaintenanceStatut.TERMINEE
          ? (materiel.etat as MaterielEtat)
          : null,
      statutMaterielApres:
        m.statut === MaintenanceStatut.TERMINEE ? MaterielStatut.EN_SERVICE : null,
      etatMaterielApres: m.statut === MaintenanceStatut.TERMINEE ? MaterielEtat.BON : null,
      datePlanifiee: daysOffset(m.daysAgoPlanifiee),
      dateDebut: m.daysAgoDebut != null ? daysOffset(m.daysAgoDebut) : null,
      dateFin: m.daysAgoFin != null ? daysOffset(m.daysAgoFin) : null,
      cout: m.cout,
      createdById: createdBy.id,
    });
  }

  logger.info(`Maintenances seeded: ${DEMO_MAINTENANCES.length}`);
};
