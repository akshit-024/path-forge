import { Router } from 'express';

import type { AppServices } from '../types/services.js';
import { notFoundHandler } from '../middleware/error-handler.js';
import { createAnalysisRouter } from './analysis.js';
import { createCatalogRouter } from './catalog.js';
import { createGraphRouter } from './graph.js';
import { createHealthRouter } from './health.js';

export function createApiRouter(services: AppServices): Router {
  const router = Router();
  router.use('/health', createHealthRouter(services.health));
  router.use(createCatalogRouter(services.catalog));
  router.use('/analysis', createAnalysisRouter(services.analysis));
  router.use('/graph', createGraphRouter(services.graph));
  router.use(notFoundHandler);
  return router;
}
