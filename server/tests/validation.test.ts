import { describe, expect, it } from 'vitest';

import { ValidationError } from '../src/errors/app-error.js';
import {
  parseAnalysisRequest,
  parseCurrentSkillsQuery,
  parseOptionalTrackSlug,
} from '../src/services/validation.js';

describe('analysis request validation', () => {
  it('maps normalized legacy slugs to project proficiency', () => {
    expect(
      parseAnalysisRequest({
        targetRoleSlug: 'backend-developer',
        currentSkillSlugs: ['python', 'sql', 'python', 'sql'],
      }),
    ).toEqual({
      targetRoleSlug: 'backend-developer',
      currentSkills: [
        { skillSlug: 'python', proficiency: 'project' },
        { skillSlug: 'sql', proficiency: 'project' },
      ],
    });
  });

  it('accepts proficiency and track data while normalizing identical duplicates', () => {
    expect(
      parseAnalysisRequest({
        targetRoleSlug: 'frontend-developer',
        targetTrackSlug: 'react-frontend',
        currentSkills: [
          { skillSlug: 'html', proficiency: 'project' },
          { skillSlug: 'typescript', proficiency: 'comfortable' },
          { skillSlug: 'html', proficiency: 'project' },
        ],
      }),
    ).toEqual({
      targetRoleSlug: 'frontend-developer',
      targetTrackSlug: 'react-frontend',
      currentSkills: [
        { skillSlug: 'html', proficiency: 'project' },
        { skillSlug: 'typescript', proficiency: 'comfortable' },
      ],
    });
  });

  it('rejects conflicting duplicate proficiency values', () => {
    expect(() =>
      parseAnalysisRequest({
        targetRoleSlug: 'frontend-developer',
        currentSkills: [
          { skillSlug: 'typescript', proficiency: 'learning' },
          { skillSlug: 'typescript', proficiency: 'project' },
        ],
      }),
    ).toThrow(ValidationError);
  });

  it('requires exactly one current-skill representation', () => {
    expect(() => parseAnalysisRequest({ targetRoleSlug: 'frontend-developer' })).toThrow(
      ValidationError,
    );
    expect(() =>
      parseAnalysisRequest({
        targetRoleSlug: 'frontend-developer',
        currentSkillSlugs: [],
        currentSkills: [],
      }),
    ).toThrow(ValidationError);
  });

  it('rejects unexpected fields, invalid proficiency values, and malformed slugs', () => {
    expect(() =>
      parseAnalysisRequest({
        targetRoleSlug: 'Backend Developer',
        currentSkillSlugs: ['python'],
        surprise: true,
      }),
    ).toThrow(ValidationError);
    expect(() =>
      parseAnalysisRequest({
        targetRoleSlug: 'frontend-developer',
        currentSkills: [{ skillSlug: 'html', proficiency: 'expert' }],
      }),
    ).toThrow(ValidationError);
    expect(() =>
      parseAnalysisRequest({
        targetRoleSlug: 'frontend-developer',
        currentSkills: [{ skillSlug: 'html', proficiency: 'project', surprise: true }],
      }),
    ).toThrow(ValidationError);
  });

  it('bounds both legacy and proficiency arrays before normalization', () => {
    const tooManyLegacy = Array.from({ length: 51 }, () => 'html');
    const tooManyProficiencies = Array.from({ length: 51 }, () => ({
      skillSlug: 'html',
      proficiency: 'project',
    }));
    expect(() =>
      parseAnalysisRequest({
        targetRoleSlug: 'frontend-developer',
        currentSkillSlugs: tooManyLegacy,
      }),
    ).toThrow(ValidationError);
    expect(() =>
      parseAnalysisRequest({
        targetRoleSlug: 'frontend-developer',
        currentSkills: tooManyProficiencies,
      }),
    ).toThrow(ValidationError);
  });

  it('enforces the maximum selected-skill target count at fifty entries', () => {
    const maxAllowed = Array.from({ length: 50 }, (_, index) => ({
      skillSlug: `skill-${index}`,
      proficiency: 'project' as const,
    }));
    expect(
      parseAnalysisRequest({
        targetRoleSlug: 'frontend-developer',
        currentSkills: maxAllowed,
      }),
    ).toMatchObject({ currentSkills: maxAllowed });
  });

  it('normalizes duplicate legacy targets to unique current skills', () => {
    const result = parseAnalysisRequest({
      targetRoleSlug: 'frontend-developer',
      currentSkillSlugs: ['html', 'html', 'typescript', 'html', 'typescript'],
    });
    expect(result.currentSkills).toEqual([
      { skillSlug: 'html', proficiency: 'project' },
      { skillSlug: 'typescript', proficiency: 'project' },
    ]);
  });

  it('validates optional track slugs and treats empty values as absent', () => {
    expect(parseOptionalTrackSlug(undefined)).toBeUndefined();
    expect(parseOptionalTrackSlug('')).toBeUndefined();
    expect(parseOptionalTrackSlug('python-fastapi')).toBe('python-fastapi');
    expect(() => parseOptionalTrackSlug('Python FastAPI')).toThrow(ValidationError);
  });

  it('parses and bounds the graph current-skills query', () => {
    expect(parseCurrentSkillsQuery('python,sql,python')).toEqual(['python', 'sql']);
    expect(() => parseCurrentSkillsQuery(['python', 'sql'])).toThrow(ValidationError);
  });
});
