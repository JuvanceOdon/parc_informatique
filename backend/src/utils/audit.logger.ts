import type { Request } from 'express';
import type { AuditAction, AuditCategorie } from '../shared/constants/audit.constants.js';
import { logger } from './logger.js';
import { journalAuditRepository } from '../modules/journal-audit/journal-audit.repository.js';

export interface AuditLogInput {
  utilisateurId?: number | null;
  action: AuditAction;
  categorie: AuditCategorie;
  description: string;
  entiteType?: string | null;
  entiteId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadonnees?: Record<string, unknown> | null;
}

export const getAuditContextFromRequest = (
  req: Request,
): { ipAddress: string | null; userAgent: string | null } => ({
  ipAddress: req.ip ?? req.socket.remoteAddress ?? null,
  userAgent: req.get('user-agent') ?? null,
});

export const auditLogger = {
  async log(input: AuditLogInput): Promise<void> {
    await journalAuditRepository.create(input);
  },

  fireAndForget(input: AuditLogInput): void {
    void this.log(input).catch((error) => {
      logger.error('Échec enregistrement journal audit', { error, action: input.action });
    });
  },

  fromRequest(
    req: Request,
    input: Omit<AuditLogInput, 'ipAddress' | 'userAgent'> & {
      utilisateurId?: number | null;
    },
  ): void {
    const context = getAuditContextFromRequest(req);
    this.fireAndForget({
      ...input,
      utilisateurId: input.utilisateurId ?? req.user?.id ?? null,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  },
};
