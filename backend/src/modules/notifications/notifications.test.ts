import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { authGet, loginAsAdmin } from '../../test/helpers.js';

describe('Notifications API', () => {
  const app = createApp();
  let token = '';

  it('setup: login as admin', async () => {
    const session = await loginAsAdmin(app);
    token = session.accessToken;
  });

  it('GET /api/v1/notifications returns user notifications', async () => {
    const response = await authGet(app, token, '/api/v1/notifications');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/v1/notifications/non-lues/count returns count', async () => {
    const response = await authGet(app, token, '/api/v1/notifications/non-lues/count');

    expect(response.status).toBe(200);
    expect(response.body.data.count).toEqual(expect.any(Number));
  });
});
