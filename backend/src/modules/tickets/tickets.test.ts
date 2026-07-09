import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import {
  authGet,
  authPatch,
  authPost,
  getSeedCategoryId,
  loginAsAdmin,
  uniqueSuffix,
} from '../../test/helpers.js';
import { TicketStatut } from '../../shared/constants/ticket.constants.js';

describe('Tickets API', () => {
  const app = createApp();
  let token = '';
  let adminUserId = 0;
  let materielId: number | null = null;
  let ticketId: number | null = null;

  it('setup: login and create materiel for ticket link', async () => {
    const session = await loginAsAdmin(app);
    token = session.accessToken;
    adminUserId = session.user.id;
    const categorieId = await getSeedCategoryId(app, token);

    const materiel = await authPost(app, token, '/api/v1/materiels', {
      designation: `Matériel ticket ${uniqueSuffix()}`,
      categorieId,
      statut: 'EN_STOCK',
    });
    expect(materiel.status).toBe(201);
    materielId = materiel.body.data.id;
  });

  it('POST /api/v1/tickets creates a ticket', async () => {
    const suffix = uniqueSuffix();
    const response = await authPost(app, token, '/api/v1/tickets', {
      titre: `Panne imprimante ${suffix}`,
      description: 'Description détaillée du problème rencontré sur le matériel.',
      materielId,
      priorite: 'HAUTE',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.numeroTicket).toMatch(/^TKT-/);
    ticketId = response.body.data.id;
  });

  it('GET /api/v1/tickets/:id returns detail with commentaires', async () => {
    const response = await authGet(app, token, `/api/v1/tickets/${ticketId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(ticketId);
    expect(Array.isArray(response.body.data.commentaires)).toBe(true);
  });

  it('POST /api/v1/tickets/:id/commentaires adds a comment', async () => {
    const response = await authPost(app, token, `/api/v1/tickets/${ticketId}/commentaires`, {
      contenu: 'Commentaire de test automatisé',
    });

    expect(response.status).toBe(201);
  });

  it('PATCH /api/v1/tickets/:id/assigner assigns staff before status change', async () => {
    const response = await authPatch(app, token, `/api/v1/tickets/${ticketId}/assigner`, {
      assigneeId: adminUserId,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.assignee?.id).toBe(adminUserId);
  });

  it('PATCH /api/v1/tickets/:id/statut changes status', async () => {
    const response = await authPatch(app, token, `/api/v1/tickets/${ticketId}/statut`, {
      statut: TicketStatut.EN_COURS,
      commentaire: 'Prise en charge par le test',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.statut).toBe(TicketStatut.EN_COURS);
  });

  it('GET /api/v1/tickets/:id/historique returns audit trail', async () => {
    const response = await authGet(app, token, `/api/v1/tickets/${ticketId}/historique`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(1);
  });

  it('GET /api/v1/tickets supports filters', async () => {
    const response = await authGet(app, token, '/api/v1/tickets?statut=EN_COURS&limit=10');

    expect(response.status).toBe(200);
    expect(response.body.data.every((t: { statut: string }) => t.statut === 'EN_COURS')).toBe(true);
  });
});
