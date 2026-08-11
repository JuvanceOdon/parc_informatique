import { TicketPriorite } from './ticket.constants.js';

/** Délais d'engagement internes MFA (techniciens du service, pas sous-traitance). */
export const TICKET_SLA_HEURES: Record<TicketPriorite, number> = {
  [TicketPriorite.CRITIQUE]: 24,
  [TicketPriorite.HAUTE]: 48,
  [TicketPriorite.MOYENNE]: 72,
  [TicketPriorite.BASSE]: 168,
};

export const TICKET_SLA_REGLES = (
  Object.entries(TICKET_SLA_HEURES) as [TicketPriorite, number][]
).map(([priorite, delaiHeures]) => ({ priorite, delaiHeures }));

export const getTicketSlaDeadline = (createdAt: Date, priorite: string): Date => {
  const hours = TICKET_SLA_HEURES[priorite as TicketPriorite] ?? TICKET_SLA_HEURES[TicketPriorite.MOYENNE];
  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
};

export const isTicketSlaBreached = (
  createdAt: Date,
  priorite: string,
  now: Date = new Date(),
): boolean => now.getTime() > getTicketSlaDeadline(createdAt, priorite).getTime();

export const getTicketSlaHoursOverdue = (
  createdAt: Date,
  priorite: string,
  now: Date = new Date(),
): number => {
  const deadline = getTicketSlaDeadline(createdAt, priorite);
  const diff = now.getTime() - deadline.getTime();
  return diff > 0 ? Math.floor(diff / (60 * 60 * 1000)) : 0;
};
