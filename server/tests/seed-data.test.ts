import { describe, expect, it } from 'vitest';

import {
  prerequisites,
  projects,
  projectSkills,
  requirements,
  roles,
  seedData,
  skills,
  trackRequirements,
  tracks,
  validateSeedData,
  type SeedData,
} from '../src/db/seed-data.js';
import {
  UPSERT_REQUIREMENTS_QUERY,
  UPSERT_ROLE_TRACKS_QUERY,
  UPSERT_TRACK_REQUIREMENTS_QUERY,
  UPSERT_TRACKS_QUERY,
} from '../src/db/queries.js';

function cloneSeedData(): SeedData {
  return structuredClone(seedData);
}

describe('seed data', () => {
  it('contains the requested tracks and a realistic, internally consistent graph', () => {
    expect(validateSeedData).not.toThrow();
    expect(roles).toHaveLength(10);
    expect(skills).toHaveLength(66);
    expect(projects.length).toBeGreaterThanOrEqual(12);
    expect(projects.length).toBeLessThanOrEqual(15);
    expect(requirements.length).toBeGreaterThan(80);
    expect(prerequisites.length).toBeGreaterThan(30);
    expect(projectSkills.length).toBeGreaterThan(40);
    expect(trackRequirements.length).toBeGreaterThan(80);
    expect(tracks.map((track) => track.slug)).toEqual([
      'react-frontend',
      'angular-frontend',
      'vuejs-frontend',
      'mern-stack',
      'mean-stack',
      'pern-stack',
      'react-django-stack',
      'nodejs-express-backend',
      'python-fastapi-backend',
      'java-spring-boot-backend',
      'llm-rag-engineering',
      'nlp-engineering',
      'computer-vision-engineering',
      'power-bi-analytics',
      'tableau-analytics',
      'python-analytics',
    ]);
  });

  it('rejects duplicate track slugs', () => {
    const data = cloneSeedData();
    data.tracks.push({ ...data.tracks[0]! });
    expect(() => validateSeedData(data)).toThrow('Duplicate track slug');
  });

  it('rejects unknown role and skill references', () => {
    const unknownRole = cloneSeedData();
    unknownRole.tracks[0]!.parentRoleSlug = 'missing-role';
    expect(() => validateSeedData(unknownRole)).toThrow('unknown parent role');

    const unknownSkill = cloneSeedData();
    unknownSkill.trackRequirements[0]!.skillSlug = 'missing-skill';
    expect(() => validateSeedData(unknownSkill)).toThrow(
      'Track requirement references an unknown node',
    );
  });

  it('rejects self-links, exact duplicate requirements, and prerequisite cycles', () => {
    const selfLink = cloneSeedData();
    selfLink.prerequisites = [{ beforeSlug: 'html', afterSlug: 'html' }];
    expect(() => validateSeedData(selfLink)).toThrow('Self prerequisite');

    const duplicateRequirement = cloneSeedData();
    duplicateRequirement.trackRequirements.push({
      ...duplicateRequirement.trackRequirements[0]!,
    });
    expect(() => validateSeedData(duplicateRequirement)).toThrow('Duplicate track requirement');

    const cycle = cloneSeedData();
    cycle.prerequisites = [
      { beforeSlug: 'html', afterSlug: 'css' },
      { beforeSlug: 'css', afterSlug: 'html' },
    ];
    expect(() => validateSeedData(cycle)).toThrow('Prerequisite cycle detected');
  });

  it('rejects invalid requirement metadata and empty tracks', () => {
    const invalidImportance = cloneSeedData();
    invalidImportance.trackRequirements[0]!.importance = 'primary' as never;
    expect(() => validateSeedData(invalidImportance)).toThrow('Invalid requirement importance');

    const invalidWeight = cloneSeedData();
    invalidWeight.trackRequirements[0]!.weight = 6;
    expect(() => validateSeedData(invalidWeight)).toThrow('Invalid requirement weight');

    const invalidTargetLevel = cloneSeedData();
    invalidTargetLevel.trackRequirements[0]!.targetLevel = 'expert' as never;
    expect(() => validateSeedData(invalidTargetLevel)).toThrow('Invalid requirement target level');

    const emptyTrack = cloneSeedData();
    const emptyTrackSlug = emptyTrack.tracks[0]!.slug;
    emptyTrack.trackRequirements = emptyTrack.trackRequirements.filter(
      (requirement) => requirement.trackSlug !== emptyTrackSlug,
    );
    expect(() => validateSeedData(emptyTrack)).toThrow(
      `Track has no requirements: ${emptyTrackSlug}`,
    );
  });

  it('uses parameterized MERGE statements for idempotent track seeding', () => {
    const queries = [
      UPSERT_TRACKS_QUERY,
      UPSERT_ROLE_TRACKS_QUERY,
      UPSERT_TRACK_REQUIREMENTS_QUERY,
      UPSERT_REQUIREMENTS_QUERY,
    ];
    for (const query of queries) {
      expect(query).toContain('$items');
      expect(query).toMatch(/\bMERGE\b/);
      expect(query).not.toMatch(/\b(?:DELETE|DETACH)\b/);
    }
  });
});
