import { db } from '../../database/connection.js';
import { categories } from '../../database/schema/categories.schema.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { services } from '../../database/schema/services.schema.js';
import { MaterielEtat, MaterielStatut } from '../../shared/constants/materiel.constants.js';
import { logger } from '../../utils/logger.js';

type DemoMateriel = {
  codeMateriel: string;
  numeroSerie: string;
  designation: string;
  marque: string;
  modele: string;
  categorieCode: string;
  serviceCode: string | null;
  localisation: string;
  dateAcquisition: string;
  dateFinGarantie: string;
  statut: MaterielStatut;
  etat: MaterielEtat;
  description: string;
};

const DEMO_MATERIELS: DemoMateriel[] = [
  {
    codeMateriel: 'PC-INFO-001',
    numeroSerie: 'DL-LAT-5540-001',
    designation: 'PC portable Dell Latitude 5540',
    marque: 'Dell',
    modele: 'Latitude 5540',
    categorieCode: 'ORDINATEUR',
    serviceCode: 'SVC-INFO',
    localisation: 'Bureau DSI — Bâtiment A',
    dateAcquisition: '2024-03-15',
    dateFinGarantie: '2027-03-15',
    statut: MaterielStatut.EN_SERVICE,
    etat: MaterielEtat.BON,
    description: 'Poste du responsable informatique (Jean Rakoto)',
  },
  {
    codeMateriel: 'PC-RH-001',
    numeroSerie: 'HP-ELI-840-014',
    designation: 'PC portable HP EliteBook 840',
    marque: 'HP',
    modele: 'EliteBook 840 G9',
    categorieCode: 'ORDINATEUR',
    serviceCode: 'SVC-RH',
    localisation: 'Bureau RH — Bâtiment B',
    dateAcquisition: '2023-11-02',
    dateFinGarantie: '2026-11-02',
    statut: MaterielStatut.EN_SERVICE,
    etat: MaterielEtat.BON,
    description: 'Poste de la chef RH (Marie Rasoanaivo)',
  },
  {
    codeMateriel: 'PC-RH-002',
    numeroSerie: 'LN-T14-8821',
    designation: 'PC portable Lenovo ThinkPad T14',
    marque: 'Lenovo',
    modele: 'ThinkPad T14 Gen 3',
    categorieCode: 'ORDINATEUR',
    serviceCode: 'SVC-RH',
    localisation: 'Open space RH — Bâtiment B',
    dateAcquisition: '2024-01-20',
    dateFinGarantie: '2027-01-20',
    statut: MaterielStatut.EN_SERVICE,
    etat: MaterielEtat.BON,
    description: 'Poste de Sophie Razafy (gestion du personnel)',
  },
  {
    codeMateriel: 'PC-LOG-001',
    numeroSerie: 'AC-ASP-5515',
    designation: 'PC portable Acer Aspire 5',
    marque: 'Acer',
    modele: 'Aspire 5 A515',
    categorieCode: 'ORDINATEUR',
    serviceCode: 'SVC-LOG',
    localisation: 'Magasin logistique',
    dateAcquisition: '2023-06-10',
    dateFinGarantie: '2026-06-10',
    statut: MaterielStatut.EN_SERVICE,
    etat: MaterielEtat.MOYEN,
    description: 'Poste de Mamy Ravelo (suivi stocks)',
  },
  {
    codeMateriel: 'PC-INFO-002',
    numeroSerie: 'DL-OPT-7090-088',
    designation: 'PC de bureau Dell OptiPlex 7090',
    marque: 'Dell',
    modele: 'OptiPlex 7090',
    categorieCode: 'ORDINATEUR',
    serviceCode: 'SVC-INFO',
    localisation: 'Salle réseau — Bâtiment A',
    dateAcquisition: '2024-05-08',
    dateFinGarantie: '2027-05-08',
    statut: MaterielStatut.EN_SERVICE,
    etat: MaterielEtat.NEUF,
    description: 'Poste de Fara Rajaonarison (support N1)',
  },
  {
    codeMateriel: 'IMP-RH-001',
    numeroSerie: 'HP-LJ-M428-221',
    designation: 'Imprimante multifonction HP LaserJet',
    marque: 'HP',
    modele: 'LaserJet Pro MFP M428fdw',
    categorieCode: 'IMPRIMANTE',
    serviceCode: 'SVC-RH',
    localisation: 'Couloir RH — Bâtiment B',
    dateAcquisition: '2022-09-12',
    dateFinGarantie: '2025-09-12',
    statut: MaterielStatut.EN_MAINTENANCE,
    etat: MaterielEtat.MAUVAIS,
    description: 'Bourrage papier fréquent — intervention en cours',
  },
  {
    codeMateriel: 'SRV-INFO-001',
    numeroSerie: 'DL-PWR-R740-007',
    designation: 'Serveur Dell PowerEdge R740',
    marque: 'Dell',
    modele: 'PowerEdge R740',
    categorieCode: 'SERVEUR',
    serviceCode: 'SVC-INFO',
    localisation: 'Salle serveurs — Bâtiment A',
    dateAcquisition: '2021-04-18',
    dateFinGarantie: '2026-04-18',
    statut: MaterielStatut.EN_SERVICE,
    etat: MaterielEtat.BON,
    description: 'Serveur applicatif principal (Active Directory / fichiers)',
  },
  {
    codeMateriel: 'NET-INFO-001',
    numeroSerie: 'CS-C9300-44',
    designation: 'Switch Cisco Catalyst 9300',
    marque: 'Cisco',
    modele: 'Catalyst 9300-48P',
    categorieCode: 'RESEAU',
    serviceCode: 'SVC-INFO',
    localisation: 'Baie réseau — Bâtiment A',
    dateAcquisition: '2023-02-28',
    dateFinGarantie: '2028-02-28',
    statut: MaterielStatut.EN_SERVICE,
    etat: MaterielEtat.BON,
    description: 'Cœur de réseau local MFA',
  },
  {
    codeMateriel: 'PC-STOCK-001',
    numeroSerie: 'HP-PRO-450-991',
    designation: 'PC portable HP ProBook 450',
    marque: 'HP',
    modele: 'ProBook 450 G10',
    categorieCode: 'ORDINATEUR',
    serviceCode: 'SVC-INFO',
    localisation: 'Réserve informatique',
    dateAcquisition: '2025-01-10',
    dateFinGarantie: '2028-01-10',
    statut: MaterielStatut.EN_STOCK,
    etat: MaterielEtat.NEUF,
    description: 'Poste neuf prêt à affecter',
  },
  {
    codeMateriel: 'PC-HS-001',
    numeroSerie: 'LN-E14-2019-003',
    designation: 'PC portable Lenovo ThinkPad E14 (ancien)',
    marque: 'Lenovo',
    modele: 'ThinkPad E14 Gen 1',
    categorieCode: 'ORDINATEUR',
    serviceCode: 'SVC-LOG',
    localisation: 'Réserve — hors service',
    dateAcquisition: '2019-08-01',
    dateFinGarantie: '2022-08-01',
    statut: MaterielStatut.HORS_SERVICE,
    etat: MaterielEtat.MAUVAIS,
    description: 'Carte mère défectueuse — en attente de réforme',
  },
];

export const seedMateriels = async (): Promise<void> => {
  const cats = await db.select({ id: categories.id, code: categories.code }).from(categories);
  const svcs = await db.select({ id: services.id, code: services.code }).from(services);
  const catByCode = Object.fromEntries(cats.map((c) => [c.code, c.id]));
  const svcByCode = Object.fromEntries(svcs.map((s) => [s.code, s.id]));

  for (const m of DEMO_MATERIELS) {
    const categorieId = catByCode[m.categorieCode];
    if (!categorieId) throw new Error(`Catégorie ${m.categorieCode} introuvable`);

    await db.insert(materiels).values({
      codeMateriel: m.codeMateriel,
      numeroSerie: m.numeroSerie,
      designation: m.designation,
      marque: m.marque,
      modele: m.modele,
      categorieId,
      serviceId: m.serviceCode ? svcByCode[m.serviceCode] ?? null : null,
      localisation: m.localisation,
      dateAcquisition: m.dateAcquisition,
      dateFinGarantie: m.dateFinGarantie,
      statut: m.statut,
      etat: m.etat,
      description: m.description,
      actif: true,
    });
  }

  logger.info(`Materiels seeded: ${DEMO_MATERIELS.length}`);
};
