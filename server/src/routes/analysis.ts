import { Router } from 'express';

import type { AnalysisService } from '../types/services.js';
import { asyncHandler } from '../utils/async-handler.js';
import { parseAnalysisRequest } from '../services/validation.js';

export function createAnalysisRouter(service: AnalysisService): Router {
  const router = Router();
  router.post(
    '/',
    asyncHandler(async (request, response) => {
      const input = parseAnalysisRequest(request.body);
      response.status(200).json({ data: await service.analyze(input) });
    }),
  );
  return router;
}
