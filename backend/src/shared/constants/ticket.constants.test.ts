import { describe, expect, it } from 'vitest';
import {
  TicketPriorite,
  TicketStatut,
  canTransitionTicketStatut,
  isTicketTerminal,
} from './ticket.constants.js';

describe('ticket.constants', () => {
  it('identifies terminal statuses', () => {
    expect(isTicketTerminal(TicketStatut.FERME)).toBe(true);
    expect(isTicketTerminal(TicketStatut.ANNULE)).toBe(true);
    expect(isTicketTerminal(TicketStatut.OUVERT)).toBe(false);
  });

  it('allows valid status transitions', () => {
    expect(canTransitionTicketStatut(TicketStatut.OUVERT, TicketStatut.EN_COURS)).toBe(true);
    expect(canTransitionTicketStatut(TicketStatut.OUVERT, TicketStatut.FERME)).toBe(false);
    expect(canTransitionTicketStatut(TicketStatut.RESOLU, TicketStatut.FERME)).toBe(true);
  });

  it('blocks transitions from annule', () => {
    expect(canTransitionTicketStatut(TicketStatut.ANNULE, TicketStatut.OUVERT)).toBe(false);
  });

  it('exposes all priority values', () => {
    expect(Object.values(TicketPriorite)).toContain('MOYENNE');
    expect(Object.values(TicketPriorite)).toHaveLength(4);
  });
});
