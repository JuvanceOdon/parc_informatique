import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { authGet, authHeader, loginAsAdmin } from '../../test/helpers.js';

describe('Auth API', () => {
  const app = createApp();

  it('POST /api/v1/auth/login rejects invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifiant: 'ADMIN001', motDePasse: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login rejects invalid payload', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifiant: '' });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/auth/login succeeds with admin seed account', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifiant: 'ADMIN001', motDePasse: 'Admin@123456' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.matricule).toBe('ADMIN001');
    expect(response.body.data.tokens.accessToken).toBeTruthy();
    expect(response.body.data.tokens.refreshToken).toBeTruthy();
  });

  it('GET /api/v1/auth/profile requires authentication', async () => {
    const response = await request(app).get('/api/v1/auth/profile');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/v1/auth/profile returns authenticated user', async () => {
    const { accessToken } = await loginAsAdmin(app);

    const response = await request(app)
      .get('/api/v1/auth/profile')
      .set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.role.code).toBe('ADMIN');
  });
});
