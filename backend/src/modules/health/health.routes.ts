import { Router } from 'express';
import { healthController } from './health.controller.js';

const healthRoutes = Router();

healthRoutes.get('/', healthController.check);

export default healthRoutes;
