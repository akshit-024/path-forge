import { Router } from 'express';

import type { GraphService } from '../types/services.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  parseCurrentSkillsQuery,
  parseOptionalTrackSlug,
  parseRoleSlug,
} from '../services/validation.js';

export function createGraphRouter(service: GraphService): Router {
  const router = Router();
  router.get(
    '/roles/:roleSlug',
    asyncHandler(async (request, response) => {
      const roleSlug = parseRoleSlug(request.params.roleSlug);
      const currentSkillSlugs = parseCurrentSkillsQuery(request.query.currentSkillSlugs);
      const trackSlug = parseOptionalTrackSlug(request.query.trackSlug);
      const graph = trackSlug
        ? await service.getRoleGraph(roleSlug, currentSkillSlugs, trackSlug)
        : await service.getRoleGraph(roleSlug, currentSkillSlugs);
      response
        .status(200)
        .json({ data: graph });
    }),
  );
  return router;
}
