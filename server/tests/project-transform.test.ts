import { describe, expect, it } from 'vitest';

import { transformRecommendedProjects } from '../src/services/analysis-service.js';

describe('project recommendation transformation', () => {
  it('keeps graph evidence and produces a human-readable reason', () => {
    const [recommendation] = transformRecommendedProjects([
      {
        project: {
          slug: 'api-monitor',
          name: 'API Monitor',
          summary: 'Monitor an API.',
          difficulty: 'intermediate',
          estimatedHours: 20,
          category: 'Backend',
        },
        coveredSkills: [
          { slug: 'rest-apis', name: 'REST APIs', weight: 5 },
          { slug: 'observability', name: 'Observability', weight: 3 },
        ],
        coverageCount: 2,
        coverageWeight: 8,
        practicalScore: 5,
      },
    ]);

    expect(recommendation?.coveredSkills).toHaveLength(2);
    expect(recommendation?.coverageWeight).toBe(8);
    expect(recommendation?.reason).toContain('REST APIs, Observability');
  });
});
