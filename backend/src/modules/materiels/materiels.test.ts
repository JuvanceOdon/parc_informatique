import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import {
  authGet,
  authPost,
  authPut,
  getSeedCategoryId,
  getSeedServiceId,
  loginAsAdmin,
  uniqueSuffix,
} from '../../test/helpers.js';

describe('Materiels API', () => {
  const app = createApp();
  let token = '';
  let categorieId = 0;
  let serviceId = 0;
  let materielId: number | null = null;

  it('setup: login and resolve seed references', async () => {
    const session = await loginAsAdmin(app);
    token = session.accessToken;
    categorieId = await getSeedCategoryId(app, token);
    serviceId = await getSeedServiceId(app, token);
  });

  it('POST /api/v1/materiels creates a materiel', async () => {
    const suffix = uniqueSuffix();
    const response = await authPost(app, token, '/api/v1/materiels', {
      designation: `PC Test ${suffix}`,
      marque: 'Dell',
      modele: 'Latitude',
      categorieId,
      serviceId,
      statut: 'EN_STOCK',
      etat: 'BON',
      numeroSerie: `SN-${suffix}`,
    });

    expect(response.status).toBe(201);
    expect(response.body.data.codeMateriel).toMatch(/^MAT-/);
    materielId = response.body.data.id;
  });

  it('GET /api/v1/materiels lists materiels with pagination', async () => {
    const response = await authGet(app, token, '/api/v1/materiels?page=1&limit=5&search=PC Test');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.meta.total).toBeGreaterThan(0);
  });

  it('GET /api/v1/materiels/:id returns detail', async () => {
    const response = await authGet(app, token, `/api/v1/materiels/${materielId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(materielId);
    expect(response.body.data.categorie.id).toBe(categorieId);
  });

  it('GET /api/v1/materiels/:id/historique returns history entries', async () => {
    const response = await authGet(app, token, `/api/v1/materiels/${materielId}/historique`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].action).toBe('CREATION');
  });

  it('PUT /api/v1/materiels/:id updates materiel', async () => {
    const response = await authPut(app, token, `/api/v1/materiels/${materielId}`, {
      localisation: 'Bureau test',
      etat: 'MOYEN',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.localisation).toBe('Bureau test');
  });

  it('GET /api/v1/materiels/:id/qrcode returns QR payload', async () => {
    const response = await authGet(app, token, `/api/v1/materiels/${materielId}/qrcode`);

    expect(response.status).toBe(200);
    expect(response.body.data.qrCodeDataUrl).toMatch(/^data:image/);
  });

  it('rejects unauthenticated access', async () => {
    const response = await request(app).get('/api/v1/materiels');
    expect(response.status).toBe(401);
  });
});
