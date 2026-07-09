import path from 'node:path';
import './shared/types/express.types.js';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler, requestLogger } from './middlewares/index.js';
import { healthRoutes } from './modules/health/index.js';
import { authRoutes } from './modules/auth/index.js';
import { utilisateursRoutes } from './modules/utilisateurs/index.js';
import { servicesRoutes } from './modules/services/index.js';
import { categoriesRoutes } from './modules/categories/index.js';
import { materielsRoutes } from './modules/materiels/index.js';
import { affectationsRoutes } from './modules/affectations/index.js';
import { ticketsRoutes } from './modules/tickets/index.js';
import { maintenancesRoutes } from './modules/maintenances/index.js';
import { notificationsRoutes } from './modules/notifications/index.js';
import { dashboardRoutes } from './modules/dashboard/index.js';
import { rapportsRoutes } from './modules/rapports/index.js';
import { journalAuditRoutes } from './modules/journal-audit/index.js';
import { ErrorCode, ErrorMessages } from './shared/errors/error-codes.js';
import { buildErrorResponse } from './utils/response.util.js';

const createRateLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.app.isProduction ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json(
        buildErrorResponse(
          ErrorMessages[ErrorCode.RATE_LIMIT_EXCEEDED],
          ErrorCode.RATE_LIMIT_EXCEEDED,
        ),
      );
    },
  });

export const createApp = (): Express => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(
    compression({
      filter: (req, res) => {
        if (req.path.includes('/rapports')) return false;
        const type = res.getHeader('Content-Type');
        if (
          typeof type === 'string' &&
          (type.includes('application/pdf') ||
            type.includes('spreadsheetml') ||
            type.includes('octet-stream'))
        ) {
          return false;
        }
        return compression.filter(req, res);
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(requestLogger);
  app.use(createRateLimiter());

  app.use('/uploads', express.static(path.resolve(process.cwd(), config.upload.dir)));

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: `${config.app.name} API`,
      version: '1.0.0',
      documentation: `${config.app.apiPrefix}/health`,
    });
  });

  app.use(`${config.app.apiPrefix}/health`, healthRoutes);
  app.use(`${config.app.apiPrefix}/auth`, authRoutes);
  app.use(`${config.app.apiPrefix}/utilisateurs`, utilisateursRoutes);
  app.use(`${config.app.apiPrefix}/services`, servicesRoutes);
  app.use(`${config.app.apiPrefix}/categories`, categoriesRoutes);
  app.use(`${config.app.apiPrefix}/materiels`, materielsRoutes);
  app.use(`${config.app.apiPrefix}/affectations`, affectationsRoutes);
  app.use(`${config.app.apiPrefix}/tickets`, ticketsRoutes);
  app.use(`${config.app.apiPrefix}/maintenances`, maintenancesRoutes);
  app.use(`${config.app.apiPrefix}/notifications`, notificationsRoutes);
  app.use(`${config.app.apiPrefix}/dashboard`, dashboardRoutes);
  app.use(`${config.app.apiPrefix}/rapports`, rapportsRoutes);
  app.use(`${config.app.apiPrefix}/journal-audit`, journalAuditRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
