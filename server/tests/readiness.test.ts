import { describe, expect, it } from 'vitest';

import { calculateReadiness, PROFICIENCY_FACTORS } from '../src/services/readiness.js';
import type { CurrentSkillDto, RequirementDefinitionDto } from '../src/types/domain.js';

function requirement(slug: string, weight: number): RequirementDefinitionDto {
  return {
    slug,
    name: slug,
    category: 'Testing',
    description: 'A test skill.',
    difficulty: 'foundation',
    importance: 'core',
    weight,
    targetLevel: 'intermediate',
  };
}

function currentSkill(
  skillSlug: string,
  proficiency: CurrentSkillDto['proficiency'],
): CurrentSkillDto {
  return { skillSlug, proficiency };
}

describe('calculateReadiness', () => {
  it.each([
    ['learning', 0.35, 35],
    ['comfortable', 0.7, 70],
    ['project', 1, 100],
  ] as const)(
    'applies the %s proficiency multiplier',
    (proficiency, expectedFactor, expectedPercentage) => {
      const result = calculateReadiness(
        [requirement('typescript', 4)],
        [currentSkill('typescript', proficiency)],
      );

      expect(PROFICIENCY_FACTORS[proficiency]).toBe(expectedFactor);
      expect(result).toMatchObject({
        matchedWeight: proficiency === 'project' ? 4 : 0,
        earnedWeight: 4 * expectedFactor,
        totalWeight: 4,
        readinessPercentage: expectedPercentage,
      });
      expect(result.assessedRequirements[0]).toMatchObject({
        slug: 'typescript',
        selected: true,
        proficiency,
        factor: expectedFactor,
        contribution: 4 * expectedFactor,
      });
    },
  );

  it('scores mixed proficiencies from the unrounded contribution sum and classifies absence', () => {
    const result = calculateReadiness(
      [
        requirement('html', 5),
        requirement('typescript', 4),
        requirement('accessibility', 3),
        requirement('testing', 2),
      ],
      [
        currentSkill('html', 'project'),
        currentSkill('typescript', 'comfortable'),
        currentSkill('accessibility', 'learning'),
      ],
    );

    expect(result).toMatchObject({
      matchedWeight: 5,
      earnedWeight: 8.85,
      totalWeight: 14,
      readinessPercentage: 63.2,
    });
    expect(
      result.assessedRequirements.map(({ slug, proficiency, factor, contribution }) => ({
        slug,
        proficiency,
        factor,
        contribution,
      })),
    ).toEqual([
      { slug: 'html', proficiency: 'project', factor: 1, contribution: 5 },
      { slug: 'typescript', proficiency: 'comfortable', factor: 0.7, contribution: 2.8 },
      { slug: 'accessibility', proficiency: 'learning', factor: 0.35, contribution: 1.05 },
      { slug: 'testing', proficiency: null, factor: 0, contribution: 0 },
    ]);
  });

  it('ignores proficiencies for skills that are not requirements', () => {
    expect(
      calculateReadiness([requirement('required', 3)], [currentSkill('unrelated', 'project')]),
    ).toMatchObject({ matchedWeight: 0, earnedWeight: 0, totalWeight: 3, readinessPercentage: 0 });
  });

  it('returns zero rather than dividing by zero when a role has no requirements', () => {
    expect(calculateReadiness([], [currentSkill('html', 'project')])).toEqual({
      assessedRequirements: [],
      matchedWeight: 0,
      earnedWeight: 0,
      totalWeight: 0,
      readinessPercentage: 0,
    });
  });

  it('produces independent readiness results per target requirement set', () => {
    const backendResult = calculateReadiness(
      [requirement('python', 5), requirement('sql', 3)],
      [currentSkill('python', 'project')],
    );
    const frontendResult = calculateReadiness(
      [requirement('javascript', 5), requirement('react', 4)],
      [currentSkill('python', 'project')],
    );

    expect(backendResult.readinessPercentage).toBe(62.5);
    expect(frontendResult.readinessPercentage).toBe(0);
    expect(backendResult.assessedRequirements.map((row) => row.slug)).toEqual(['python', 'sql']);
    expect(frontendResult.assessedRequirements.map((row) => row.slug)).toEqual([
      'javascript',
      'react',
    ]);
  });

  it('propagates selected proficiencies into each matching assessed requirement', () => {
    const result = calculateReadiness(
      [requirement('python', 5), requirement('sql', 4), requirement('git', 2)],
      [
        currentSkill('python', 'learning'),
        currentSkill('sql', 'comfortable'),
        currentSkill('git', 'project'),
      ],
    );

    expect(
      result.assessedRequirements.map((item) => ({
        slug: item.slug,
        selected: item.selected,
        proficiency: item.proficiency,
        factor: item.factor,
      })),
    ).toEqual([
      { slug: 'python', selected: true, proficiency: 'learning', factor: 0.35 },
      { slug: 'sql', selected: true, proficiency: 'comfortable', factor: 0.7 },
      { slug: 'git', selected: true, proficiency: 'project', factor: 1 },
    ]);
  });
});
