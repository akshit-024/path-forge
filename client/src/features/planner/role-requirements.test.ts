import { describe, expect, it } from 'vitest';
import type { GraphResponse, Role } from '../../types/domain';
import { extractRoleRequirements } from './role-requirements';

const frontendRole: Role = {
  slug: 'frontend-developer',
  name: 'Frontend Developer',
  summary: 'Build accessible interfaces.',
  description: 'Create maintainable web experiences.',
  category: 'Software Engineering',
  experienceLevel: 'Early career',
};

const graph: GraphResponse = {
  role: frontendRole,
  track: null,
  nodes: [
    {
      data: {
        id: 'Role:frontend-developer',
        type: 'role',
        label: frontendRole.name,
        slug: frontendRole.slug,
        category: frontendRole.category,
      },
    },
    {
      data: {
        id: 'Skill:javascript',
        type: 'skill',
        label: 'JavaScript',
        slug: 'javascript',
        category: 'Programming Languages',
        description: 'Program interactive applications.',
        difficulty: 'foundation',
      },
    },
    {
      data: {
        id: 'Skill:git',
        type: 'skill',
        label: 'Git',
        slug: 'git',
        category: 'Developer Tools',
        description: 'Track and review source changes.',
        difficulty: 'foundation',
      },
    },
    {
      data: {
        id: 'Skill:react',
        type: 'skill',
        label: 'React',
        slug: 'react',
        category: 'Frontend',
        description: 'Build component-based interfaces.',
        difficulty: 'intermediate',
      },
    },
    {
      data: {
        id: 'Skill:machine-learning',
        type: 'skill',
        label: 'Machine Learning',
        slug: 'machine-learning',
        category: 'AI and Machine Learning',
        description: 'Train predictive models.',
        difficulty: 'advanced',
      },
    },
  ],
  edges: [
    {
      data: {
        id: 'frontend-requires-javascript',
        source: 'Role:frontend-developer',
        target: 'Skill:javascript',
        type: 'REQUIRES',
        label: 'REQUIRES',
        importance: 'core',
        weight: 5,
        targetLevel: 'intermediate',
      },
    },
    {
      data: {
        id: 'frontend-requires-react',
        source: 'Role:frontend-developer',
        target: 'Skill:react',
        type: 'REQUIRES',
        label: 'REQUIRES',
        importance: 'core',
        weight: 5,
        targetLevel: 'intermediate',
      },
    },
    {
      data: {
        id: 'frontend-requires-git',
        source: 'Role:frontend-developer',
        target: 'Skill:git',
        type: 'REQUIRES',
        label: 'REQUIRES',
        importance: 'supporting',
        weight: 3,
        targetLevel: 'foundation',
      },
    },
    {
      data: {
        id: 'other-role-requires-machine-learning',
        source: 'Role:ai-engineer',
        target: 'Skill:machine-learning',
        type: 'REQUIRES',
        label: 'REQUIRES',
        importance: 'core',
        weight: 5,
        targetLevel: 'advanced',
      },
    },
  ],
};

describe('extractRoleRequirements', () => {
  it('uses REQUIRES edges rather than categories to identify the selected role requirements', () => {
    const requirements = extractRoleRequirements(graph);

    expect(requirements.map((requirement) => requirement.slug)).toEqual([
      'javascript',
      'react',
      'git',
    ]);
    expect(requirements).toContainEqual(
      expect.objectContaining({
        slug: 'javascript',
        category: 'Programming Languages',
        importance: 'core',
        targetLevel: 'intermediate',
      }),
    );
    expect(requirements).toContainEqual(
      expect.objectContaining({
        slug: 'git',
        category: 'Developer Tools',
        importance: 'supporting',
      }),
    );
    expect(requirements.some((requirement) => requirement.slug === 'machine-learning')).toBe(false);
  });
});
