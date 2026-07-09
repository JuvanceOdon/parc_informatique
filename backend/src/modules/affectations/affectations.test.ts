import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import {
  authGet,
  authPatch,
  authPost,
  getSeedCategoryId,
  getSeedServiceId,
  loginAsAdmin,
  uniqueSuffix,
} from '../../test/helpers.js';

describe('Affectations API', () => {
  const app = createApp();
  let token = '';
  let adminUserId = 0;
  let materielId: number | null = null;
  let affectationId: number | null = null;

  it('setup: login and create materiel for affectation', async () => {
    const session = await loginAsAdmin(app);
    token = session.accessToken;
    adminUserId = session.user.id;

    const categorieId = await getSeedCategoryId(app, token);
    const serviceId = await getSeedServiceId(app, token);

    const materiel = await authPost(app, token, '/api/v1/materiels', {
      designation: `Matériel affectation ${uniqueSuffix()}`,
      categorieId,
      serviceId,
      statut: 'EN_STOCK',
    });
    expect(materiel.status).toBe(201);
    materielId = materiel.body.data.id;
  });

  it('POST /api/v1/affectations assigns materiel to user', async () => {
    const response = await authPost(app, token, '/api/v1/affectations', {
      materielId,
      utilisateurId: adminUserId,
      localisation: 'Bureau admin',
      motif: 'Test automatisé',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.statut).toBe('ACTIVE');
    affectationId = response.body.data.id;
  });

  it('GET /api/v1/affectations lists active affectations', async () => {
    const response = await authGet(app, token, '/api/v1/affectations?activeOnly=true');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/affectations/:id returns detail', async () => {
    const response = await authGet(app, token, `/api/v1/affectations/${affectationId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(affectationId);
  });

  it('GET /api/v1/affectations/materiel/:id/active returns current affectation', async () => {
    const response = await authGet(app, token, `/api/v1/affectations/materiel/${materielId}/active`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(affectationId);
  });

  it('PATCH /api/v1/affectations/:id/terminer ends affectation', async () => {
    const response = await authPatch(app, token, `/api/v1/affectations/${affectationId}/terminer`, {
      motif: 'Fin de test',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.statut).toBe('TERMINEE');
  });

  it('GET /api/v1/affectations/materiel/:id/historique returns history', async () => {
    const response = await authGet(app, token, `/api/v1/affectations/materiel/${materielId}/historique`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});

describe('Maintenances API', () => {
  const app = createApp();
  let token = '';
  let adminUserId = 0;
  let materielId: number | null = null;
  let maintenanceId: number | null = null;

  it('setup: login and create materiel', async () => {
    const session = await loginAsAdmin(app);
    token = session.accessToken;
    adminUserId = session.user.id;
    const categorieId = await getSeedCategoryId(app, token);

    const materiel = await authPost(app, token, '/api/v1/materiels', {
      designation: `Matériel maintenance ${uniqueSuffix()}`,
      categorieId,
      statut: 'EN_STOCK',
    });
    expect(materiel.status).toBe(201);
    materielId = materiel.body.data.id;
  });

  it('POST /api/v1/maintenances creates maintenance', async () => {
    const response = await authPost(app, token, '/api/v1/maintenances', {
      materielId,
      type: 'PREVENTIVE',
      titre: `Maintenance test ${uniqueSuffix()}`,
      description: 'Maintenance créée par test automatisé',
      technicienId: adminUserId,
    });

    expect(response.status).toBe(201);
    expect(response.body.data.numeroMaintenance).toMatch(/^MNT-/);
    maintenanceId = response.body.data.id;
  });

  it('GET /api/v1/maintenances lists maintenances', async () => {
    const response = await authGet(app, token, `/api/v1/maintenances?materielId=${materielId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('PATCH /api/v1/maintenances/:id/demarrer starts maintenance', async () => {
    const response = await authPatch(app, token, `/api/v1/maintenances/${maintenanceId}/demarrer`);

    expect(response.status).toBe(200);
    expect(response.body.data.statut).toBe('EN_COURS');
  });
});
