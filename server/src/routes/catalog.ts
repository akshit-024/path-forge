import { Router } from 'express';

import type { CatalogService } from '../types/services.js';
import { asyncHandler } from '../utils/async-handler.js';
import { parseOptionalTrackSlug, parseRoleSlug } from '../services/validation.js';

export function createCatalogRouter(service: CatalogService): Router {
  const router = Router();
  router.get(
    '/roles',
    asyncHandler(async (_request, response) => {
      response.status(200).json({ data: await service.listRoles() });
    }),
  );
  router.get(
    '/roles/:roleSlug/tracks',
    asyncHandler(async (request, response) => {
      const roleSlug = parseRoleSlug(request.params.roleSlug);
      response.status(200).json({ data: await service.listRoleTracks(roleSlug) });
    }),
  );
  router.get(
    '/roles/:roleSlug/requirements',
    asyncHandler(async (request, response) => {
      const roleSlug = parseRoleSlug(request.params.roleSlug);
      const trackSlug = parseOptionalTrackSlug(request.query.trackSlug);
      const requirements = trackSlug
        ? await service.getRoleRequirements(roleSlug, trackSlug)
        : await service.getRoleRequirements(roleSlug);
      response
        .status(200)
        .json({ data: requirements });
    }),
  );
  router.get(
    '/skills',
    asyncHandler(async (_request, response) => {
      response.status(200).json({ data: await service.listSkills() });
    }),
  );
  return router;
}
