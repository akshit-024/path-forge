import { render, screen } from '@testing-library/react';
import type { AnalysisResult, AssessedRequirement } from '../../types/domain';
import { NextPriorities } from './NextPriorities';
import { deriveNextPriorities } from './priority-recommendations';

function gap(
  slug: string,
  importance: 'core' | 'supporting',
  weight: number,
  targetLevel: 'foundation' | 'intermediate' | 'advanced',
): AssessedRequirement {
  return {
    slug,
    name: slug
      .split('-')
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(' '),
    category: 'Testing',
    description: `Learn ${slug}.`,
    difficulty: targetLevel,
    importance,
    weight,
    targetLevel,
    selected: false,
    proficiency: null,
    factor: 0,
    contribution: 0,
  };
}

function analysis(missingSkills: AssessedRequirement[]): AnalysisResult {
  return {
    targetRole: {
      slug: 'frontend-developer',
      name: 'Frontend Developer',
      summary: 'Build interfaces.',
      description: 'Build interfaces.',
      category: 'Engineering',
      experienceLevel: 'early-career',
    },
    targetTrack: null,
    readinessPercentage: missingSkills.length === 0 ? 100 : 20,
    assessedRequirements: missingSkills,
    demonstratedSkills: [],
    comfortableSkills: [],
    developingSkills: [],
    matchedSkills: [],
    missingSkills,
    coreMissingSkills: missingSkills.filter((skill) => skill.importance === 'core'),
    supportingMissingSkills: missingSkills.filter((skill) => skill.importance === 'supporting'),
    learningPaths: [],
    recommendedProjects: [],
    similarRoles: [],
    explanation: {
      matchedWeight: 0,
      earnedWeight: 0,
      totalWeight: 10,
      formula: 'weighted',
      selectedSkillCount: 0,
      proficiencyFactors: { learning: 0.35, comfortable: 0.7, project: 1 },
      calculations: [],
    },
  };
}

describe('NextPriorities', () => {
  it('orders core gaps, weight, target level and name before taking three', () => {
    const result = deriveNextPriorities(
      analysis([
        gap('supporting-heavy', 'supporting', 5, 'foundation'),
        gap('zeta-core', 'core', 4, 'advanced'),
        gap('beta-core', 'core', 4, 'foundation'),
        gap('alpha-core', 'core', 4, 'foundation'),
      ]),
    );

    expect(result.map((priority) => priority.skill.slug)).toEqual([
      'alpha-core',
      'beta-core',
      'zeta-core',
    ]);
  });

  it('uses existing path and project data for its next action', () => {
    const target = gap('react', 'core', 5, 'intermediate');
    const fixture = analysis([target]);
    fixture.learningPaths = [
      {
        targetSkill: target,
        isDirectTarget: false,
        explanation: 'A mapped path.',
        steps: [
          {
            skill: gap('javascript', 'core', 5, 'foundation'),
            status: 'next',
          },
          { skill: target, status: 'later' },
        ],
      },
    ];
    fixture.recommendedProjects = [
      {
        project: {
          slug: 'component-library',
          name: 'Component Library',
          summary: 'Build components.',
          category: 'Frontend',
          difficulty: 'intermediate',
          estimatedHours: 20,
        },
        coveredSkills: [{ slug: 'react', name: 'React', weight: 5 }],
        coverageCount: 1,
        coverageWeight: 5,
        practicalScore: 2,
        reason: 'Practices React.',
      },
    ];

    render(<NextPriorities analysis={fixture} />);

    expect(screen.getByText(/Start with Javascript/)).toBeInTheDocument();
    expect(screen.getByText(/Project evidence:/)).toHaveTextContent('Component Library');
  });

  it('renders a positive completion state when no gaps remain', () => {
    render(<NextPriorities analysis={analysis([])} />);
    expect(screen.getByText('All mapped requirements are covered')).toBeInTheDocument();
  });
});
