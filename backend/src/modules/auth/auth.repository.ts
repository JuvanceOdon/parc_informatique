import { eq, or, and, isNull, gt } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import { roles } from '../../database/schema/roles.schema.js';
import { utilisateurs } from '../../database/schema/utilisateurs.schema.js';
import { refreshTokens } from '../../database/schema/refresh-tokens.schema.js';
import type { IAuthRepository } from './auth.interfaces.js';
import type { UserWithRoleRow } from './auth.types.js';

const userWithRoleSelect = {
  id: utilisateurs.id,
  matricule: utilisateurs.matricule,
  email: utilisateurs.email,
  motDePasse: utilisateurs.motDePasse,
  nom: utilisateurs.nom,
  prenom: utilisateurs.prenom,
  telephone: utilisateurs.telephone,
  roleId: utilisateurs.roleId,
  serviceId: utilisateurs.serviceId,
  actif: utilisateurs.actif,
  derniereConnexion: utilisateurs.derniereConnexion,
  roleCode: roles.code,
  roleLibelle: roles.libelle,
};

export class AuthRepository implements IAuthRepository {
  async findByIdentifiant(identifiant: string): Promise<UserWithRoleRow | null> {
    const normalized = identifiant.trim().toLowerCase();

    const [user] = await db
      .select(userWithRoleSelect)
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id))
      .where(
        or(
          eq(utilisateurs.email, normalized),
          eq(utilisateurs.matricule, identifiant.trim().toUpperCase()),
        ),
      )
      .limit(1);

    return user ?? null;
  }

  async findByIdWithRole(id: number): Promise<UserWithRoleRow | null> {
    const [user] = await db
      .select(userWithRoleSelect)
      .from(utilisateurs)
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id))
      .where(eq(utilisateurs.id, id))
      .limit(1);

    return user ?? null;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await db
      .update(utilisateurs)
      .set({
        derniereConnexion: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(utilisateurs.id, userId));
  }

  async createRefreshToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<number> {
    const [result] = await db
      .insert(refreshTokens)
      .values({
        utilisateurId: userId,
        tokenHash,
        expiresAt,
      })
      .returning({ id: refreshTokens.id });

    return result?.id ?? 0;
  }

  async findActiveRefreshTokens(
    userId: number,
  ): Promise<Array<{ id: number; tokenHash: string }>> {
    return db
      .select({ id: refreshTokens.id, tokenHash: refreshTokens.tokenHash })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.utilisateurId, userId),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      );
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.utilisateurId, userId),
          isNull(refreshTokens.revokedAt),
        ),
      );
  }

  async findUserByRefreshTokenHash(tokenHash: string): Promise<UserWithRoleRow | null> {
    const [row] = await db
      .select(userWithRoleSelect)
      .from(refreshTokens)
      .innerJoin(utilisateurs, eq(refreshTokens.utilisateurId, utilisateurs.id))
      .innerJoin(roles, eq(utilisateurs.roleId, roles.id))
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return row ?? null;
  }
}

export const authRepository = new AuthRepository();
