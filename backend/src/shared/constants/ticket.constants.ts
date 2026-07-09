export enum TicketPriorite {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  CRITIQUE = 'CRITIQUE',
}

export enum TicketStatut {
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  EN_ATTENTE = 'EN_ATTENTE',
  RESOLU = 'RESOLU',
  FERME = 'FERME',
  ANNULE = 'ANNULE',
}

export enum TicketHistoriqueAction {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  CHANGEMENT_STATUT = 'CHANGEMENT_STATUT',
  CHANGEMENT_PRIORITE = 'CHANGEMENT_PRIORITE',
  ASSIGNATION = 'ASSIGNATION',
  COMMENTAIRE = 'COMMENTAIRE',
  PIECE_JOINTE_AJOUT = 'PIECE_JOINTE_AJOUT',
  PIECE_JOINTE_SUPPRESSION = 'PIECE_JOINTE_SUPPRESSION',
}

export const TICKET_PRIORITES = Object.values(TicketPriorite);
export const TICKET_STATUTS = Object.values(TicketStatut);

export const TICKET_PRIORITE_LABELS: Record<TicketPriorite, string> = {
  [TicketPriorite.BASSE]: 'Basse',
  [TicketPriorite.MOYENNE]: 'Moyenne',
  [TicketPriorite.HAUTE]: 'Haute',
  [TicketPriorite.CRITIQUE]: 'Critique',
};

export const TICKET_STATUT_LABELS: Record<TicketStatut, string> = {
  [TicketStatut.OUVERT]: 'Ouvert',
  [TicketStatut.EN_COURS]: 'En cours',
  [TicketStatut.EN_ATTENTE]: 'En attente',
  [TicketStatut.RESOLU]: 'Résolu',
  [TicketStatut.FERME]: 'Fermé',
  [TicketStatut.ANNULE]: 'Annulé',
};

const TERMINAL_STATUTS = new Set<TicketStatut>([TicketStatut.FERME, TicketStatut.ANNULE]);

export const isTicketTerminal = (statut: TicketStatut): boolean => TERMINAL_STATUTS.has(statut);

export const TICKET_STATUT_TRANSITIONS: Record<TicketStatut, TicketStatut[]> = {
  [TicketStatut.OUVERT]: [TicketStatut.EN_COURS, TicketStatut.EN_ATTENTE, TicketStatut.ANNULE],
  [TicketStatut.EN_COURS]: [TicketStatut.EN_ATTENTE, TicketStatut.RESOLU, TicketStatut.ANNULE],
  [TicketStatut.EN_ATTENTE]: [TicketStatut.EN_COURS, TicketStatut.RESOLU, TicketStatut.ANNULE],
  [TicketStatut.RESOLU]: [TicketStatut.FERME, TicketStatut.EN_COURS],
  [TicketStatut.FERME]: [TicketStatut.EN_COURS],
  [TicketStatut.ANNULE]: [],
};

export const canTransitionTicketStatut = (
  from: TicketStatut,
  to: TicketStatut,
): boolean => TICKET_STATUT_TRANSITIONS[from]?.includes(to) ?? false;
