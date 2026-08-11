import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { affectations } from '../../database/schema/affectations.schema.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { services } from '../../database/schema/services.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { AffectationStatut } from '../../shared/constants/affectation.constants.js';
import { logger } from '../../utils/logger.js';

type DemoAffectation = {
  materielCode: string;
  utilisateurMatricule: string;
  serviceCode: string;
  localisation: string;
  motif: string;
  daysAgo: number;
};

const DEMO_AFFECTATIONS: DemoAffectation[] = [
  {
    materielCode: 'PC-INFO-001',
    utilisateurMatricule: 'RESP001',
    serviceCode: 'SVC-INFO',
    localisation: 'Bureau DSI — Bâtiment A',
    motif: 'Affectation poste responsable informatique',
    daysAgo: 120,
  },
  {
    materielCode: 'PC-RH-001',
    utilisateurMatricule: 'CHEF001',
    serviceCode: 'SVC-RH',
    localisation: 'Bureau RH — Bâtiment B',
    motif: 'Affectation poste chef de service RH',
    daysAgo: 200,
  },
  {
    materielCode: 'PC-RH-002',
    utilisateurMatricule: 'USER001',
    serviceCode: 'SVC-RH',
    localisation: 'Open space RH — Bâtiment B',
    motif: 'Poste de travail gestion du personnel',
    daysAgo: 90,
  },
  {
    materielCode: 'PC-LOG-001',
    utilisateurMatricule: 'USER002',
    serviceCode: 'SVC-LOG',
    localisation: 'Magasin logistique',
    motif: 'Suivi des entrées/sorties magasin',
    daysAgo: 150,
  },
  {
    materielCode: 'PC-INFO-002',
    utilisateurMatricule: 'USER003',
    serviceCode: 'SVC-INFO',
    localisation: 'Salle réseau — Bâtiment A',
    motif: 'Support niveau 1',
    daysAgo: 45,
  },
];

const daysAgoDate = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export const seedAffectations = async (): Promise<void> => {
  const [admin] = await db
    .select({ id: utilisateurs.id })
    .from(utilisateurs)
    .where(eq(utilisateurs.matricule, 'ADMIN001'))
    .limit(1);

  if (!admin) throw new Error('ADMIN001 introuvable pour seed affectations');

  for (const a of DEMO_AFFECTATIONS) {
    const [materiel] = await db
      .select({ id: materiels.id })
      .from(materiels)
      .where(eq(materiels.codeMateriel, a.materielCode))
      .limit(1);
    const [user] = await db
      .select({ id: utilisateurs.id })
      .from(utilisateurs)
      .where(eq(utilisateurs.matricule, a.utilisateurMatricule))
      .limit(1);
    const [service] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.code, a.serviceCode))
      .limit(1);

    if (!materiel || !user || !service) {
      throw new Error(`Données manquantes pour affectation ${a.materielCode}`);
    }

    await db.insert(affectations).values({
      materielId: materiel.id,
      utilisateurId: user.id,
      serviceId: service.id,
      localisation: a.localisation,
      dateDebut: daysAgoDate(a.daysAgo),
      dateFin: null,
      statut: AffectationStatut.ACTIVE,
      motif: a.motif,
      affecteParId: admin.id,
    });
  }

  logger.info(`Affectations seeded: ${DEMO_AFFECTATIONS.length}`);
};
