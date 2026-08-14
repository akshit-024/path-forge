import { describe, expect, it, vi } from 'vitest';

import { NotFoundError } from '../src/errors/app-error.js';
import {
  DefaultAnalysisService,
  transformLearningPaths,
} from '../src/services/analysis-service.js';
import { DefaultCatalogService } from '../src/services/catalog-service.js';
import { DefaultGraphService } from '../src/services/graph-service.js';
import type { GraphRepository } from '../src/services/repository.js';
import {
  combineRequirementDefinitions,
  TargetRequirementsResolver,
} from '../src/services/target-requirements.js';
import type { RequirementDefinitionDto, RoleDto, SkillDto, TrackDto } from '../src/types/domain.js';

const role: RoleDto = {
  slug: 'frontend-developer',
  name: 'Frontend Developer',
  summary: 'Build accessible interfaces.',
  description: 'Create responsive browser experiences.',
  category: 'Software Engineering',
  experienceLevel: 'early-career',
};

const track: TrackDto = {
  slug: 'react-frontend',
  name: 'React Frontend',
  summary: 'Build React applications.',
  description: 'Specialize in typed React interfaces.',
  category: 'Frontend Engineering',
  parentRoleSlug: role.slug,
};

const javascript: SkillDto = {
  slug: 'javascript',
  name: 'JavaScript',
  category: 'Programming Languages',
  description: 'Build browser behavior.',
  difficulty: 'foundation',
};

const react: SkillDto = {
  slug: 'react',
  name: 'React',
  category: 'Frontend',
  description: 'Build component interfaces.',
  difficulty: 'intermediate',
};

const baseJavaScript: RequirementDefinitionDto = {
  ...javascript,
  importance: 'supporting',
  weight: 3,
  targetLevel: 'foundation',
};

const trackJavaScript: RequirementDefinitionDto = {
  ...javascript,
  importance: 'core',
  weight: 5,
  targetLevel: 'advanced',
};

const trackReact: RequirementDefinitionDto = {
  ...react,
  importance: 'core',
  weight: 4,
  targetLevel: 'intermediate',
};

function requirementItem(requirement: RequirementDefinitionDto): Record<string, unknown> {
  const { importance, weight, targetLevel, ...skill } = requirement;
  return { skill, relationship: { importance, weight, targetLevel } };
}

function targetRow(selectedTrack: TrackDto | null = track): Record<string, unknown> {
  return {
    role,
    track: selectedTrack,
    baseRequirements: [requirementItem(baseJavaScript)],
    trackRequirements: selectedTrack
      ? [requirementItem(trackJavaScript), requirementItem(trackReact)]
      : [],
  };
}

function createRepository(overrides: Partial<GraphRepository> = {}): GraphRepository {
  return {
    listRoles: async () => [],
    listSkills: async () => [],
    listRoleTracks: async () => [],
    getTargetRequirements: async () => [],
    getLearningPaths: async () => [],
    getRecommendedProjects: async () => [],
    getSimilarRoles: async () => [],
    getRoleGraph: async () => [],
    ...overrides,
  };
}

describe('track requirements', () => {
  it('combines requirements by slug using the stronger metadata without double counting', () => {
    expect(combineRequirementDefinitions([baseJavaScript], [trackJavaScript, trackReact])).toEqual([
      trackJavaScript,
      trackReact,
    ]);
  });

  it('resolves a selected track and rejects unknown or incorrectly owned tracks', async () => {
    const getTargetRequirements = vi.fn(async () => [targetRow()]);
    const resolver = new TargetRequirementsResolver(createRepository({ getTargetRequirements }));

    const resolved = await resolver.resolve(role.slug, track.slug);
    expect(getTargetRequirements).toHaveBeenCalledWith(role.slug, track.slug);
    expect(resolved.track).toEqual(track);
    expect(resolved.requirements).toEqual([trackJavaScript, trackReact]);

    const unknown = new TargetRequirementsResolver(
      createRepository({ getTargetRequirements: async () => [] }),
    );
    await expect(unknown.resolve(role.slug, 'missing-track')).rejects.toBeInstanceOf(NotFoundError);

    const wrongOwner = { ...track, parentRoleSlug: 'backend-developer' };
    const ownershipMismatch = new TargetRequirementsResolver(
      createRepository({ getTargetRequirements: async () => [targetRow(wrongOwner)] }),
    );
    await expect(ownershipMismatch.resolve(role.slug, track.slug)).rejects.toThrow(
      `No track ${track.slug} was found for role ${role.slug}.`,
    );
  });

  it('lists tracks in a stable name order and distinguishes an unknown role', async () => {
    const angular = { ...track, slug: 'angular-frontend', name: 'Angular Frontend' };
    const service = new DefaultCatalogService(
      createRepository({ listRoleTracks: async () => [{ role, tracks: [track, angular] }] }),
    );
    await expect(service.listRoleTracks(role.slug)).resolves.toEqual([angular, track]);

    const unknownRoleService = new DefaultCatalogService(
      createRepository({ listRoleTracks: async () => [] }),
    );
    await expect(unknownRoleService.listRoleTracks('missing-role')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('keeps base-role analysis backward compatible and scores a selected track once', async () => {
    const getTargetRequirements = vi.fn(async (_roleSlug: string, trackSlug: string | null) => [
      targetRow(trackSlug ? track : null),
    ]);
    const repository = createRepository({ getTargetRequirements });
    const service = new DefaultAnalysisService(repository);

    const baseResult = await service.analyze({
      targetRoleSlug: role.slug,
      currentSkills: [{ skillSlug: javascript.slug, proficiency: 'project' }],
    });
    expect(baseResult.targetTrack).toBeNull();
    expect(baseResult.readinessPercentage).toBe(100);
    expect(getTargetRequirements).toHaveBeenNthCalledWith(1, role.slug, null);

    const trackResult = await service.analyze({
      targetRoleSlug: role.slug,
      targetTrackSlug: track.slug,
      currentSkills: [{ skillSlug: javascript.slug, proficiency: 'project' }],
    });
    expect(trackResult.targetTrack).toEqual(track);
    expect(trackResult.readinessPercentage).toBe(55.6);
    expect(trackResult.matchedSkills).toHaveLength(1);
    expect(trackResult.assessedRequirements).toHaveLength(2);
    expect(trackResult.explanation).toMatchObject({
      matchedWeight: 5,
      earnedWeight: 5,
      totalWeight: 9,
    });
    expect(trackResult.missingSkills.map((skill) => skill.slug)).toEqual([react.slug]);
    expect(getTargetRequirements).toHaveBeenNthCalledWith(2, role.slug, track.slug);
  });

  it('classifies proficiency results and treats every proficiency as selected for gap queries', async () => {
    const getLearningPaths = vi.fn(async () => []);
    const getRecommendedProjects = vi.fn(async () => []);
    const service = new DefaultAnalysisService(
      createRepository({
        getTargetRequirements: async () => [targetRow()],
        getLearningPaths,
        getRecommendedProjects,
      }),
    );

    const result = await service.analyze({
      targetRoleSlug: role.slug,
      targetTrackSlug: track.slug,
      currentSkills: [
        { skillSlug: javascript.slug, proficiency: 'learning' },
        { skillSlug: react.slug, proficiency: 'comfortable' },
      ],
    });

    expect(result.readinessPercentage).toBe(50.6);
    expect(result.demonstratedSkills).toEqual([]);
    expect(result.matchedSkills).toEqual([]);
    expect(result.developingSkills.map((skill) => skill.slug)).toEqual([javascript.slug]);
    expect(result.comfortableSkills.map((skill) => skill.slug)).toEqual([react.slug]);
    expect(result.missingSkills).toEqual([]);
    expect(result.explanation.calculations).toEqual([
      expect.objectContaining({
        skillSlug: javascript.slug,
        proficiency: 'learning',
        factor: 0.35,
        contribution: 1.75,
      }),
      expect.objectContaining({
        skillSlug: react.slug,
        proficiency: 'comfortable',
        factor: 0.7,
        contribution: 2.8,
      }),
    ]);
    expect(getLearningPaths).toHaveBeenCalledWith(expect.any(Array), [javascript.slug, react.slug]);
    expect(getRecommendedProjects).toHaveBeenCalledWith(expect.any(Array), [
      javascript.slug,
      react.slug,
    ]);
  });

  it('labels a learning-level prerequisite as developing instead of fully known', () => {
    const paths = transformLearningPaths(
      [{ targetSkill: react, pathSkills: [javascript, react] }],
      [{ skillSlug: javascript.slug, proficiency: 'learning' }],
    );

    expect(paths[0]?.steps.map((step) => step.status)).toEqual(['developing', 'next']);
  });

  it('emits the raw role and track requirement edges while querying the combined skill set', async () => {
    const getRoleGraph = vi.fn(async () => [{ role, prerequisitePaths: [], projectMatches: [] }]);
    const service = new DefaultGraphService(
      createRepository({
        getTargetRequirements: async () => [targetRow()],
        getRoleGraph,
      }),
    );

    const graph = await service.getRoleGraph(role.slug, [javascript.slug], track.slug);
    expect(getRoleGraph).toHaveBeenCalledWith(
      role.slug,
      [javascript.slug, react.slug],
      [javascript.slug],
    );
    expect(graph.track).toEqual(track);
    expect(graph.nodes.map((node) => node.data.id)).toEqual(
      expect.arrayContaining([
        `Role:${role.slug}`,
        `Track:${track.slug}`,
        `Skill:${javascript.slug}`,
        `Skill:${react.slug}`,
      ]),
    );
    expect(graph.edges.map(({ data }) => [data.source, data.type, data.target])).toEqual(
      expect.arrayContaining([
        [`Role:${role.slug}`, 'REQUIRES', `Skill:${javascript.slug}`],
        [`Role:${role.slug}`, 'HAS_TRACK', `Track:${track.slug}`],
        [`Track:${track.slug}`, 'REQUIRES', `Skill:${javascript.slug}`],
        [`Track:${track.slug}`, 'REQUIRES', `Skill:${react.slug}`],
      ]),
    );
  });
});
