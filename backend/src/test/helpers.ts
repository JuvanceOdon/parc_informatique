import { eq } from 'drizzle-orm';
import type { Express } from 'express';
import request from 'supertest';
import { db } from '../database/connection.js';
import { roles } from '../database/schema/roles.schema.js';
import { RoleCode } from '../shared/constants/roles.constants.js';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    matricule: string;
    role: { id: number; code: string };
  };
}

export const uniqueSuffix = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const loginAsAdmin = async (app: Express): Promise<AuthSession> => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifiant: 'ADMIN001', motDePasse: 'Admin@123456' });

  if (response.status !== 200) {
    throw new Error(`Admin login failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  return {
    accessToken: response.body.data.tokens.accessToken as string,
    refreshToken: response.body.data.tokens.refreshToken as string,
    user: response.body.data.user,
  };
};

export const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export const authGet = (app: Express, token: string, path: string) =>
  request(app).get(path).set(authHeader(token));

export const authPost = (app: Express, token: string, path: string, body: unknown) =>
  request(app).post(path).set(authHeader(token)).send(body);

export const authPut = (app: Express, token: string, path: string, body: unknown) =>
  request(app).put(path).set(authHeader(token)).send(body);

export const authPatch = (app: Express, token: string, path: string, body: unknown = {}) =>
  request(app).patch(path).set(authHeader(token)).send(body);

export const getSeedCategoryId = async (app: Express, token: string): Promise<number> => {
  const response = await authGet(app, token, '/api/v1/categories?limit=1');
  if (response.status !== 200 || !response.body.data?.[0]?.id) {
    throw new Error('No seeded category found — run npm run db:setup');
  }
  return response.body.data[0].id as number;
};

export const getSeedServiceId = async (app: Express, token: string): Promise<number> => {
  const response = await authGet(app, token, '/api/v1/services?limit=1');
  if (response.status !== 200 || !response.body.data?.[0]?.id) {
    throw new Error('No seeded service found — run npm run db:setup');
  }
  return response.body.data[0].id as number;
};

export const getRoleId = async (code: RoleCode): Promise<number> => {
  const [role] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.code, code))
    .limit(1);

  if (!role) throw new Error(`Role ${code} not found — run npm run db:setup`);
  return role.id;
};

export const getUtilisateurRoleId = async (_app: Express, _token: string): Promise<number> =>
  getRoleId(RoleCode.UTILISATEUR);
