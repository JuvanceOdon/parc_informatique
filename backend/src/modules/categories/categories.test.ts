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

describe('Categories API', () => {
  const app = createApp();
  let token = '';
  let createdId: number | null = null;

  it('setup: login as admin', async () => {
    const session = await loginAsAdmin(app);
    token = session.accessToken;
    expect(token).toBeTruthy();
  });

  it('GET /api/v1/categories returns seeded categories', async () => {
    const response = await authGet(app, token, '/api/v1/categories');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toMatchObject({
      id: expect.any(Number),
      code: expect.any(String),
      libelle: expect.any(String),
    });
  });

  it('POST /api/v1/categories creates a category', async () => {
    const suffix = uniqueSuffix();
    const response = await authPost(app, token, '/api/v1/categories', {
      code: `TEST-${suffix}`,
      libelle: `Catégorie test ${suffix}`,
      description: 'Créée par les tests automatisés',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.code).toBe(`TEST-${suffix}`);
    createdId = response.body.data.id;
  });

  it('GET /api/v1/categories/:id returns category detail', async () => {
    const response = await authGet(app, token, `/api/v1/categories/${createdId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(createdId);
  });

  it('PUT /api/v1/categories/:id updates category', async () => {
    const response = await authPut(app, token, `/api/v1/categories/${createdId}`, {
      libelle: 'Catégorie test mise à jour',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.libelle).toBe('Catégorie test mise à jour');
  });

  it('rejects unauthenticated access', async () => {
    const response = await request(app).get('/api/v1/categories');
    expect(response.status).toBe(401);
  });
});
