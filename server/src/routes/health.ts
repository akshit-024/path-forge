import { Router } from 'express';

import type { HealthService } from '../types/services.js';
import { asyncHandler } from '../utils/async-handler.js';

export function createHealthRouter(service: HealthService): Router {
  const router = Router();
  router.get(
    '/',
    asyncHandler(async (_request, response) => {
      response.status(200).json(await service.getHealth());
    }),
  );
  return router;
}
