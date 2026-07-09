import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import {
  authGet,
  authPost,
  authPut,
  loginAsAdmin,
  uniqueSuffix,
} from '../../test/helpers.js';

describe('Services API', () => {
  const app = createApp();
  let token = '';
  let createdId: number | null = null;

  it('setup: login as admin', async () => {
    const session = await loginAsAdmin(app);
    token = session.accessToken;
  });

  it('GET /api/v1/services returns seeded services', async () => {
    const response = await authGet(app, token, '/api/v1/services');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].code).toBeTruthy();
  });

  it('POST /api/v1/services creates a service', async () => {
    const suffix = uniqueSuffix();
    const response = await authPost(app, token, '/api/v1/services', {
      code: `SVC-T-${suffix}`,
      libelle: `Service test ${suffix}`,
      description: 'Service créé par test',
    });

    expect(response.status).toBe(201);
    createdId = response.body.data.id;
  });

  it('GET /api/v1/services/:id returns detail', async () => {
    const response = await authGet(app, token, `/api/v1/services/${createdId}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(createdId);
  });

  it('PUT /api/v1/services/:id updates service', async () => {
    const response = await authPut(app, token, `/api/v1/services/${createdId}`, {
      libelle: 'Service test modifié',
    });
    expect(response.status).toBe(200);
    expect(response.body.data.libelle).toBe('Service test modifié');
  });

  it('rejects unauthenticated access', async () => {
    const response = await request(app).get('/api/v1/services');
    expect(response.status).toBe(401);
  });
});
