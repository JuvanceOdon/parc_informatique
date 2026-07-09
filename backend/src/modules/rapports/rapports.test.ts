import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { authGet, loginAsAdmin } from '../../test/helpers.js';

describe('Rapports API', () => {
  const app = createApp();

  it('GET /api/v1/rapports/mensuel generates PDF', async () => {
    const session = await loginAsAdmin(app);
    const now = new Date();
    const response = await authGet(
      app,
      session.accessToken,
      `/api/v1/rapports/mensuel?mois=${now.getMonth() + 1}&annee=${now.getFullYear()}&format=pdf`,
    );

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/pdf');
  });

  it('GET /api/v1/rapports/annuel generates Excel', async () => {
    const session = await loginAsAdmin(app);
    const response = await authGet(
      app,
      session.accessToken,
      `/api/v1/rapports/annuel?annee=${new Date().getFullYear()}&format=excel`,
    );

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/spreadsheet|excel|octet-stream/i);
  });
});
