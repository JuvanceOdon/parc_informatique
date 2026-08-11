import { eq } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { materiels } from '../../database/schema/materiels.schema.js';
import { services } from '../../database/schema/services.schema.js';
import { ticketCommentaires } from '../../database/schema/ticket-commentaires.schema.js';
import { tickets } from '../../database/schema/tickets.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { TicketPriorite, TicketStatut } from '../../shared/constants/ticket.constants.js';
import { logger } from '../../utils/logger.js';

type DemoTicket = {
  numeroTicket: string;
  titre: string;
  description: string;
  materielCode: string | null;
  demandeurMatricule: string;
  assigneeMatricule: string | null;
  serviceCode: string;
  priorite: TicketPriorite;
  statut: TicketStatut;
  daysAgo: number;
  commentaire?: { auteurMatricule: string; contenu: string };
};

const DEMO_TICKETS: DemoTicket[] = [
  {
    numeroTicket: 'TKT-2026-0001',
    titre: 'Écran portable qui scintille',
    description:
      'Depuis hier, l\'écran de mon ThinkPad scintille par intermittence, surtout sur secteur. Cela gêne la saisie des dossiers RH.',
    materielCode: 'PC-RH-002',
    demandeurMatricule: 'USER001',
    assigneeMatricule: 'TECH001',
    serviceCode: 'SVC-INFO',
    priorite: TicketPriorite.HAUTE,
    statut: TicketStatut.EN_COURS,
    daysAgo: 2,
    commentaire: {
      auteurMatricule: 'TECH001',
      contenu: 'Prise en charge. Vérification du câble eDP et du pilote graphique prévue demain matin.',
    },
  },
  {
    numeroTicket: 'TKT-2026-0002',
    titre: 'Imprimante RH — bourrage papier récurrent',
    description:
      'L\'imprimante LaserJet du couloir RH se bloque toutes les 10 pages. Impossible d\'imprimer les arrêtés du jour.',
    materielCode: 'IMP-RH-001',
    demandeurMatricule: 'CHEF001',
    assigneeMatricule: 'TECH002',
    serviceCode: 'SVC-INFO',
    priorite: TicketPriorite.CRITIQUE,
    statut: TicketStatut.EN_COURS,
    daysAgo: 1,
    commentaire: {
      auteurMatricule: 'TECH002',
      contenu: 'Maintenance corrective démarrée. Rouleau d\'entraînement usé à remplacer.',
    },
  },
  {
    numeroTicket: 'TKT-2026-0003',
    titre: 'Accès dossier partagé magasin',
    description:
      'Je n\'arrive plus à ouvrir le partage \\\\mfa-fs01\\logistique depuis mon poste. Message d\'accès refusé.',
    materielCode: 'PC-LOG-001',
    demandeurMatricule: 'USER002',
    assigneeMatricule: null,
    serviceCode: 'SVC-INFO',
    priorite: TicketPriorite.MOYENNE,
    statut: TicketStatut.OUVERT,
    daysAgo: 0,
  },
  {
    numeroTicket: 'TKT-2026-0004',
    titre: 'Clavier AZERTY défectueux',
    description:
      'Plusieurs touches du clavier externe ne répondent plus (A, Z, E). Demande de remplacement depuis le stock.',
    materielCode: 'PC-INFO-002',
    demandeurMatricule: 'USER003',
    assigneeMatricule: 'TECH001',
    serviceCode: 'SVC-INFO',
    priorite: TicketPriorite.BASSE,
    statut: TicketStatut.RESOLU,
    daysAgo: 10,
    commentaire: {
      auteurMatricule: 'TECH001',
      contenu: 'Clavier remplacé depuis le stock. Ticket résolu.',
    },
  },
  {
    numeroTicket: 'TKT-2026-0005',
    titre: 'Demande de nouveau portable',
    description:
      'Besoin d\'un portable supplémentaire pour un stagiaire RH arrivant la semaine prochaine.',
    materielCode: null,
    demandeurMatricule: 'CHEF001',
    assigneeMatricule: 'RESP001',
    serviceCode: 'SVC-INFO',
    priorite: TicketPriorite.MOYENNE,
    statut: TicketStatut.EN_ATTENTE,
    daysAgo: 5,
    commentaire: {
      auteurMatricule: 'RESP001',
      contenu: 'PC-STOCK-001 disponible. Validation budgétaire en attente auprès de la direction.',
    },
  },
];

const daysAgoDate = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export const seedTickets = async (): Promise<void> => {
  for (const t of DEMO_TICKETS) {
    const [demandeur] = await db
      .select({ id: utilisateurs.id })
      .from(utilisateurs)
      .where(eq(utilisateurs.matricule, t.demandeurMatricule))
      .limit(1);
    const [service] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.code, t.serviceCode))
      .limit(1);

    if (!demandeur || !service) {
      throw new Error(`Données manquantes pour ticket ${t.numeroTicket}`);
    }

    let materielId: number | null = null;
    if (t.materielCode) {
      const [materiel] = await db
        .select({ id: materiels.id })
        .from(materiels)
        .where(eq(materiels.codeMateriel, t.materielCode))
        .limit(1);
      materielId = materiel?.id ?? null;
    }

    let assigneeId: number | null = null;
    if (t.assigneeMatricule) {
      const [assignee] = await db
        .select({ id: utilisateurs.id })
        .from(utilisateurs)
        .where(eq(utilisateurs.matricule, t.assigneeMatricule))
        .limit(1);
      assigneeId = assignee?.id ?? null;
    }

    const createdAt = daysAgoDate(t.daysAgo);
    const [created] = await db
      .insert(tickets)
      .values({
        numeroTicket: t.numeroTicket,
        titre: t.titre,
        description: t.description,
        materielId,
        demandeurId: demandeur.id,
        assigneeId,
        serviceId: service.id,
        priorite: t.priorite,
        statut: t.statut,
        dateResolution: t.statut === TicketStatut.RESOLU ? daysAgoDate(t.daysAgo - 1) : null,
        createdAt,
        updatedAt: createdAt,
      })
      .returning({ id: tickets.id });

    if (t.commentaire && created) {
      const [auteur] = await db
        .select({ id: utilisateurs.id })
        .from(utilisateurs)
        .where(eq(utilisateurs.matricule, t.commentaire.auteurMatricule))
        .limit(1);

      if (auteur) {
        await db.insert(ticketCommentaires).values({
          ticketId: created.id,
          utilisateurId: auteur.id,
          contenu: t.commentaire.contenu,
        });
      }
    }
  }

  logger.info(`Tickets seeded: ${DEMO_TICKETS.length}`);
};
