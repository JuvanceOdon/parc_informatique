import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { authHeader, loginAsAdmin } from '../../test/helpers.js';

describe('Auth API — refresh & logout', () => {
  const app = createApp();

  it('POST /api/v1/auth/refresh renews tokens', async () => {
    const session = await loginAsAdmin(app);

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.body.data.refreshToken).toBeTruthy();
  });

  it('POST /api/v1/auth/logout succeeds with token', async () => {
    const session = await loginAsAdmin(app);

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set(authHeader(session.accessToken))
      .send({ refreshToken: session.refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
