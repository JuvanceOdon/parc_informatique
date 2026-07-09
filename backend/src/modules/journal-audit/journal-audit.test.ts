import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { authGet, loginAsAdmin } from '../../test/helpers.js';

describe('Journal audit API', () => {
  const app = createApp();
  let token = '';

  it('setup: login as admin', async () => {
    const session = await loginAsAdmin(app);
    token = session.accessToken;
  });

  it('GET /api/v1/journal-audit returns audit entries', async () => {
    const response = await authGet(app, token, '/api/v1/journal-audit?limit=20');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.meta.total).toBeGreaterThan(0);
  });
});
