import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { authGet, loginAsAdmin } from '../../test/helpers.js';

describe('Dashboard API', () => {
  const app = createApp();

  it('GET /api/v1/dashboard returns KPI and charts', async () => {
    const session = await loginAsAdmin(app);
    const response = await authGet(app, session.accessToken, '/api/v1/dashboard?months=6');

    expect(response.status).toBe(200);
    expect(response.body.data.kpi).toMatchObject({
      totalMateriels: expect.any(Number),
      ticketsOuverts: expect.any(Number),
    });
    expect(response.body.data.graphiques.ticketsParMois).toBeInstanceOf(Array);
  });
});
