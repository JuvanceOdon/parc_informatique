import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import {
  authGet,
  authHeader,
  authPost,
  getUtilisateurRoleId,
  loginAsAdmin,
  uniqueSuffix,
} from '../../test/helpers.js';

describe('Utilisateurs API', () => {
  const app = createApp();
  let token = '';
  let createdUserId: number | null = null;
  let createdMatricule = '';

  it('setup: login as admin', async () => {
    const session = await loginAsAdmin(app);
    token = session.accessToken;
  });

  it('GET /api/v1/utilisateurs returns paginated users', async () => {
    const response = await authGet(app, token, '/api/v1/utilisateurs');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].role.code).toBeTruthy();
  });

  it('POST /api/v1/utilisateurs creates a user', async () => {
    const suffix = uniqueSuffix();
    const roleId = await getUtilisateurRoleId(app, token);

    const response = await authPost(app, token, '/api/v1/utilisateurs', {
      matricule: `USR-${suffix}`,
      email: `user.${suffix.toLowerCase()}@test.mfar.gov.mg`,
      motDePasse: 'Test@123456',
      nom: 'Test',
      prenom: 'Utilisateur',
      roleId,
    });

    expect(response.status).toBe(201);
    createdMatricule = response.body.data.matricule as string;
    expect(createdMatricule).toMatch(/^USR-/);
    createdUserId = response.body.data.id;
  });

  it('GET /api/v1/utilisateurs/:id returns user detail', async () => {
    const response = await authGet(app, token, `/api/v1/utilisateurs/${createdUserId}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(createdUserId);
  });

  it('PATCH desactiver/activer toggles user status', async () => {
    const deactivate = await request(app)
      .patch(`/api/v1/utilisateurs/${createdUserId}/desactiver`)
      .set(authHeader(token));

    expect(deactivate.status).toBe(200);
    expect(deactivate.body.data.actif).toBe(false);

    const activate = await request(app)
      .patch(`/api/v1/utilisateurs/${createdUserId}/activer`)
      .set(authHeader(token));

    expect(activate.status).toBe(200);
    expect(activate.body.data.actif).toBe(true);
  });

  it('rejects non-admin access', async () => {
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifiant: createdMatricule, motDePasse: 'Test@123456' });

    expect(login.status).toBe(200);
    const userToken = login.body.data.tokens.accessToken as string;
    const response = await authGet(app, userToken, '/api/v1/utilisateurs');

    expect(response.status).toBe(403);
  });
});
