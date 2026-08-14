import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import type { AppConfig } from '../src/config/env.js';
import { DatabaseNotConfiguredError, NotFoundError } from '../src/errors/app-error.js';
import type { AnalysisResponse, HealthResponse, RoleGraphResponse } from '../src/types/api.js';
import type { AppServices } from '../src/types/services.js';

const config: AppConfig = {
  nodeEnv: 'test',
  port: 3000,
  clientOrigin: 'http://localhost:5173',
  database: {
    configured: false,
    missing: ['COGNODB_URI', 'COGNODB_USERNAME', 'COGNODB_PASSWORD'],
    reason: 'not configured',
  },
};

const health: HealthResponse = {
  status: 'ok',
  database: {
    status: 'not_configured',
    message: 'CognoDB is not configured.',
  },
  timestamp: '2026-01-01T00:00:00.000Z',
};

const role = {
  slug: 'backend-developer',
  name: 'Backend Developer',
  summary: 'Build APIs.',
  category: 'Software Engineering',
  experienceLevel: 'early-career',
  description: 'Build reliable services.',
};

const track = {
  slug: 'nodejs-express-backend',
  name: 'Node.js + Express Backend',
  summary: 'Build Node.js APIs.',
  description: 'Specialize in typed Node.js and Express services.',
  category: 'Backend Engineering',
  parentRoleSlug: role.slug,
};

const analysisResult: AnalysisResponse = {
  targetRole: role,
  targetTrack: null,
  readinessPercentage: 0,
  assessedRequirements: [],
  demonstratedSkills: [],
  comfortableSkills: [],
  developingSkills: [],
  matchedSkills: [],
  missingSkills: [],
  coreMissingSkills: [],
  supportingMissingSkills: [],
  learningPaths: [],
  recommendedProjects: [],
  similarRoles: [],
  explanation: {
    matchedWeight: 0,
    earnedWeight: 0,
    totalWeight: 0,
    formula: 'matched / total',
    selectedSkillCount: 0,
    proficiencyFactors: { learning: 0.35, comfortable: 0.7, project: 1 },
    calculations: [],
  },
};

const graphResult: RoleGraphResponse = { role, track: null, nodes: [], edges: [] };

function services(overrides: Partial<AppServices> = {}): AppServices {
  return {
    health: { getHealth: async () => health },
    catalog: {
      listRoles: async () => [role],
      listSkills: async () => [],
      listRoleTracks: async () => [],
      getRoleRequirements: async () => ({ role, track: null, requirements: [] }),
    },
    analysis: { analyze: async () => analysisResult },
    graph: { getRoleGraph: async () => graphResult },
    ...overrides,
  };
}

describe('PathForge API', () => {
  it('reports database-not-configured while keeping application health HTTP 200', async () => {
    const response = await request(createApp({ config, services: services() })).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.database.status).toBe('not_configured');
    expect(response.body).not.toHaveProperty('password');
  });

  it('uses a data envelope for successful catalog responses', async () => {
    const response = await request(createApp({ config, services: services() })).get('/api/roles');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [role] });
  });

  it('lists tracks and fetches track-specific requirements through additive catalog routes', async () => {
    const listRoleTracks = vi.fn(async () => [track]);
    const getRoleRequirements = vi.fn(async () => ({
      role,
      track,
      requirements: [],
    }));
    const app = createApp({
      config,
      services: services({
        catalog: {
          listRoles: async () => [role],
          listSkills: async () => [],
          listRoleTracks,
          getRoleRequirements,
        },
      }),
    });

    const tracksResponse = await request(app).get(`/api/roles/${role.slug}/tracks`);
    const requirementsResponse = await request(app).get(
      `/api/roles/${role.slug}/requirements?trackSlug=${track.slug}`,
    );

    expect(tracksResponse.status).toBe(200);
    expect(tracksResponse.body).toEqual({ data: [track] });
    expect(listRoleTracks).toHaveBeenCalledWith(role.slug);
    expect(requirementsResponse.status).toBe(200);
    expect(requirementsResponse.body.data.track).toEqual(track);
    expect(getRoleRequirements).toHaveBeenCalledWith(role.slug, track.slug);
  });

  it('returns a safe 404 when a track does not belong to the selected role', async () => {
    const response = await request(
      createApp({
        config,
        services: services({
          catalog: {
            listRoles: async () => [role],
            listSkills: async () => [],
            listRoleTracks: async () => [],
            getRoleRequirements: async () => {
              throw new NotFoundError(
                'No track missing-track was found for role backend-developer.',
              );
            },
          },
        }),
      }),
    ).get('/api/roles/backend-developer/requirements?trackSlug=missing-track');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'No track missing-track was found for role backend-developer.',
      },
    });
  });

  it('only emits CORS permission for the configured client origin', async () => {
    const app = createApp({ config, services: services() });
    const allowed = await request(app).get('/api/roles').set('Origin', 'http://localhost:5173');
    const unapproved = await request(app)
      .get('/api/roles')
      .set('Origin', 'https://unapproved.example');

    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(unapproved.headers['access-control-allow-origin']).toBeUndefined();
    expect(unapproved.status).toBe(200);
  });

  it('normalizes duplicate skills before calling the analysis service', async () => {
    const analyze = vi.fn(async () => analysisResult);
    const response = await request(
      createApp({ config, services: services({ analysis: { analyze } }) }),
    )
      .post('/api/analysis')
      .send({
        targetRoleSlug: 'backend-developer',
        currentSkillSlugs: ['python', 'python', 'sql'],
      });

    expect(response.status).toBe(200);
    expect(analyze).toHaveBeenCalledWith({
      targetRoleSlug: 'backend-developer',
      currentSkills: [
        { skillSlug: 'python', proficiency: 'project' },
        { skillSlug: 'sql', proficiency: 'project' },
      ],
    });
  });

  it('passes an optional target track through analysis without changing legacy requests', async () => {
    const analyze = vi.fn(async () => ({ ...analysisResult, targetTrack: track }));
    const response = await request(
      createApp({ config, services: services({ analysis: { analyze } }) }),
    )
      .post('/api/analysis')
      .send({
        targetRoleSlug: role.slug,
        targetTrackSlug: track.slug,
        currentSkillSlugs: ['nodejs', 'express'],
      });

    expect(response.status).toBe(200);
    expect(response.body.data.targetTrack).toEqual(track);
    expect(analyze).toHaveBeenCalledWith({
      targetRoleSlug: role.slug,
      targetTrackSlug: track.slug,
      currentSkills: [
        { skillSlug: 'nodejs', proficiency: 'project' },
        { skillSlug: 'express', proficiency: 'project' },
      ],
    });
  });

  it('accepts and normalizes proficiency-aware analysis requests', async () => {
    const analyze = vi.fn(async () => analysisResult);
    const response = await request(
      createApp({ config, services: services({ analysis: { analyze } }) }),
    )
      .post('/api/analysis')
      .send({
        targetRoleSlug: role.slug,
        currentSkills: [
          { skillSlug: 'nodejs', proficiency: 'learning' },
          { skillSlug: 'express', proficiency: 'comfortable' },
          { skillSlug: 'nodejs', proficiency: 'learning' },
        ],
      });

    expect(response.status).toBe(200);
    expect(analyze).toHaveBeenCalledWith({
      targetRoleSlug: role.slug,
      currentSkills: [
        { skillSlug: 'nodejs', proficiency: 'learning' },
        { skillSlug: 'express', proficiency: 'comfortable' },
      ],
    });
  });

  it('rejects ambiguous requests containing both skill representations', async () => {
    const response = await request(createApp({ config, services: services() }))
      .post('/api/analysis')
      .send({
        targetRoleSlug: role.slug,
        currentSkillSlugs: ['nodejs'],
        currentSkills: [{ skillSlug: 'nodejs', proficiency: 'project' }],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('formats Zod request errors consistently', async () => {
    const response = await request(createApp({ config, services: services() }))
      .post('/api/analysis')
      .send({ targetRoleSlug: 'Backend Developer', currentSkillSlugs: 'python' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toBe('The analysis request is invalid.');
    expect(response.body.error.details).toBeDefined();
  });

  it('returns a safe 503 database-not-configured error envelope', async () => {
    const response = await request(
      createApp({
        config,
        services: services({
          catalog: {
            listRoles: async () => {
              throw new DatabaseNotConfiguredError();
            },
            listSkills: async () => [],
            listRoleTracks: async () => [],
            getRoleRequirements: async () => ({ role, track: null, requirements: [] }),
          },
        }),
      }),
    ).get('/api/roles');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: {
        code: 'DATABASE_NOT_CONFIGURED',
        message:
          'The graph database is not configured. Add the CognoDB environment variables and retry.',
      },
    });
  });

  it('parses current skills for the graph service', async () => {
    const getRoleGraph = vi.fn(async () => graphResult);
    const response = await request(
      createApp({ config, services: services({ graph: { getRoleGraph } }) }),
    ).get('/api/graph/roles/backend-developer?currentSkillSlugs=python,sql,python');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: graphResult });
    expect(getRoleGraph).toHaveBeenCalledWith('backend-developer', ['python', 'sql']);
  });

  it('passes the trackSlug query parameter to the graph service', async () => {
    const getRoleGraph = vi.fn(async () => ({ ...graphResult, track }));
    const response = await request(
      createApp({ config, services: services({ graph: { getRoleGraph } }) }),
    ).get(`/api/graph/roles/${role.slug}?currentSkillSlugs=nodejs,express&trackSlug=${track.slug}`);

    expect(response.status).toBe(200);
    expect(getRoleGraph).toHaveBeenCalledWith(role.slug, ['nodejs', 'express'], track.slug);
  });
});
