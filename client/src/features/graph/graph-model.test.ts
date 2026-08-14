import { describe, expect, it } from 'vitest';
import type { GraphEdge, GraphNode, GraphResponse, Role } from '../../types/domain';
import { getGraphNodeDetails, getGraphSemanticRanks } from './graph-model';

const role: Role = {
  slug: 'backend-developer',
  name: 'Backend Developer',
  summary: 'Build reliable services.',
  description: 'Design and operate backend systems.',
  category: 'Software Engineering',
  experienceLevel: 'Early career',
};

const nodes: GraphNode[] = [
  {
    data: {
      id: 'Role:backend-developer',
      type: 'role',
      label: 'Backend Developer',
      slug: 'backend-developer',
      category: 'Software Engineering',
    },
  },
  {
    data: {
      id: 'Skill:python',
      type: 'skill',
      label: 'Python',
      slug: 'python',
      category: 'Programming Languages',
      description: 'Write maintainable Python services.',
      difficulty: 'foundation',
    },
  },
  {
    data: {
      id: 'Skill:api-design',
      type: 'skill',
      label: 'API Design',
      slug: 'api-design',
      category: 'Backend',
      description: 'Design stable service contracts.',
      difficulty: 'intermediate',
    },
  },
  {
    data: {
      id: 'Skill:basics',
      type: 'skill',
      label: 'Programming Basics',
      slug: 'basics',
      category: 'Foundations',
      description: 'Understand programming fundamentals.',
      difficulty: 'foundation',
    },
  },
  {
    data: {
      id: 'Skill:logic',
      type: 'skill',
      label: 'Computational Logic',
      slug: 'logic',
      category: 'Foundations',
      description: 'Reason about programs.',
      difficulty: 'foundation',
    },
  },
  {
    data: {
      id: 'Skill:unrelated',
      type: 'skill',
      label: 'Unrelated Skill',
      slug: 'unrelated',
      category: 'Other',
    },
  },
  {
    data: {
      id: 'Project:zeta-service',
      type: 'project',
      label: 'Zeta Service',
      slug: 'zeta-service',
      category: 'Backend',
      summary: 'Build a production service.',
      difficulty: 'advanced',
      estimatedHours: 18,
    },
  },
  {
    data: {
      id: 'Project:api-lab',
      type: 'project',
      label: 'API Lab',
      slug: 'api-lab',
      category: 'Backend',
      summary: 'Practice API design.',
      difficulty: 'intermediate',
      estimatedHours: 8,
    },
  },
];

const edges: GraphEdge[] = [
  {
    data: {
      id: 'requires-python',
      source: 'Role:backend-developer',
      target: 'Skill:python',
      type: 'REQUIRES',
      label: 'REQUIRES',
      importance: 'core',
      weight: 5,
      targetLevel: 'intermediate',
    },
  },
  {
    data: {
      id: 'requires-api',
      source: 'Role:backend-developer',
      target: 'Skill:api-design',
      type: 'REQUIRES',
      label: 'REQUIRES',
      importance: 'supporting',
      weight: 3,
      targetLevel: 'intermediate',
    },
  },
  {
    data: {
      id: 'basics-before-python',
      source: 'Skill:basics',
      target: 'Skill:python',
      type: 'PREREQUISITE_FOR',
      label: 'PREREQUISITE_FOR',
    },
  },
  {
    data: {
      id: 'logic-before-basics',
      source: 'Skill:logic',
      target: 'Skill:basics',
      type: 'PREREQUISITE_FOR',
      label: 'PREREQUISITE_FOR',
    },
  },
  {
    data: {
      id: 'python-before-api',
      source: 'Skill:python',
      target: 'Skill:api-design',
      type: 'PREREQUISITE_FOR',
      label: 'PREREQUISITE_FOR',
    },
  },
  {
    data: {
      id: 'zeta-builds-python',
      source: 'Project:zeta-service',
      target: 'Skill:python',
      type: 'BUILDS',
      label: 'BUILDS',
    },
  },
  {
    data: {
      id: 'lab-builds-python',
      source: 'Project:api-lab',
      target: 'Skill:python',
      type: 'BUILDS',
      label: 'BUILDS',
    },
  },
  {
    data: {
      id: 'lab-builds-api',
      source: 'Project:api-lab',
      target: 'Skill:api-design',
      type: 'BUILDS',
      label: 'BUILDS',
    },
  },
  {
    data: {
      id: 'duplicate-lab-builds-api',
      source: 'Project:api-lab',
      target: 'Skill:api-design',
      type: 'BUILDS',
      label: 'BUILDS',
    },
  },
  {
    data: {
      id: 'missing-cross-edge',
      source: 'Project:missing',
      target: 'Skill:python',
      type: 'BUILDS',
      label: 'BUILDS',
    },
  },
];

const graph: GraphResponse = { role, track: null, nodes, edges };

const trackGraph: GraphResponse = {
  role,
  track: {
    slug: 'node-express',
    name: 'Node.js and Express',
    summary: 'Build production Node.js services.',
    description: 'Specialize in Express APIs and service reliability.',
    category: 'Backend',
    parentRoleSlug: role.slug,
  },
  nodes: [
    ...nodes,
    {
      data: {
        id: 'Track:node-express',
        type: 'track',
        label: 'Node.js and Express',
        slug: 'node-express',
        category: 'Backend',
        description: 'Specialize in Express APIs and service reliability.',
        parentRoleSlug: role.slug,
      },
    },
    {
      data: {
        id: 'Skill:express',
        type: 'skill',
        label: 'Express',
        slug: 'express',
        category: 'Backend',
        difficulty: 'intermediate',
      },
    },
  ],
  edges: [
    ...edges,
    {
      data: {
        id: 'backend-has-node-express',
        source: 'Role:backend-developer',
        target: 'Track:node-express',
        type: 'HAS_TRACK',
        label: 'HAS_TRACK',
      },
    },
    {
      data: {
        id: 'track-requires-python',
        source: 'Track:node-express',
        target: 'Skill:python',
        type: 'REQUIRES',
        label: 'REQUIRES',
        importance: 'supporting',
        weight: 4,
        targetLevel: 'advanced',
      },
    },
    {
      data: {
        id: 'track-requires-express',
        source: 'Track:node-express',
        target: 'Skill:express',
        type: 'REQUIRES',
        label: 'REQUIRES',
        importance: 'core',
        weight: 5,
        targetLevel: 'advanced',
      },
    },
  ],
};

describe('getGraphNodeDetails', () => {
  it('counts only unique, direct skill requirements for a role', () => {
    const details = getGraphNodeDetails(graph, 'Role:backend-developer');

    expect(details?.node.type).toBe('role');
    expect(details?.node.slug).toBe('backend-developer');
    expect(details?.directRequirementCount).toBe(2);
  });

  it('returns skill metadata, selected-role relationship data, and direct incoming connections', () => {
    const details = getGraphNodeDetails(graph, 'Skill:python');

    expect(details?.node.category).toBe('Programming Languages');
    expect(details?.node.difficulty).toBe('foundation');
    expect(details?.node.description).toBe('Write maintainable Python services.');
    expect(details?.selectedRoleRequirement).toEqual({
      importance: 'core',
      weight: 5,
      targetLevel: 'intermediate',
    });
    expect(details?.prerequisites).toEqual([
      {
        id: 'Skill:basics',
        type: 'skill',
        label: 'Programming Basics',
        slug: 'basics',
      },
    ]);
    expect(details?.projects).toEqual([
      {
        id: 'Project:api-lab',
        type: 'project',
        label: 'API Lab',
        slug: 'api-lab',
      },
      {
        id: 'Project:zeta-service',
        type: 'project',
        label: 'Zeta Service',
        slug: 'zeta-service',
      },
    ]);
  });

  it('returns project metadata and deduped, alphabetical built skills', () => {
    const details = getGraphNodeDetails(graph, 'Project:api-lab');

    expect(details?.node.difficulty).toBe('intermediate');
    expect(details?.node.estimatedHours).toBe(8);
    expect(details?.node.summary).toBe('Practice API design.');
    expect(details?.builtSkills).toEqual([
      {
        id: 'Skill:api-design',
        type: 'skill',
        label: 'API Design',
        slug: 'api-design',
      },
      {
        id: 'Skill:python',
        type: 'skill',
        label: 'Python',
        slug: 'python',
      },
    ]);
  });

  it('returns null for an ID that is not in the graph', () => {
    expect(getGraphNodeDetails(graph, 'Skill:missing')).toBeNull();
  });

  it('derives Track parent/count details and keeps role and track requirement provenance separate', () => {
    const trackDetails = getGraphNodeDetails(trackGraph, 'Track:node-express');
    const skillDetails = getGraphNodeDetails(trackGraph, 'Skill:python');

    expect(trackDetails?.directRequirementCount).toBe(2);
    expect(trackDetails?.parentRole).toMatchObject({
      id: 'Role:backend-developer',
      label: 'Backend Developer',
    });
    expect(skillDetails?.selectedRoleRequirement).toMatchObject({ importance: 'core', weight: 5 });
    expect(skillDetails?.selectedTrackRequirement).toEqual({
      importance: 'supporting',
      weight: 4,
      targetLevel: 'advanced',
    });
  });

  it('deduplicates shared base-and-track skills even when duplicate requirement edges are present', () => {
    const duplicateTrackRequirement = {
      data: {
        ...trackGraph.edges.find(({ data }) => data.id === 'track-requires-python')!.data,
        id: 'z-duplicate-track-requires-python',
      },
    };
    const graphWithDuplicateEdge: GraphResponse = {
      ...trackGraph,
      edges: [...trackGraph.edges, duplicateTrackRequirement],
    };

    expect(graphWithDuplicateEdge.nodes.filter(({ data }) => data.slug === 'python')).toHaveLength(
      1,
    );
    expect(
      getGraphNodeDetails(graphWithDuplicateEdge, 'Role:backend-developer')?.directRequirementCount,
    ).toBe(2);
    expect(
      getGraphNodeDetails(graphWithDuplicateEdge, 'Track:node-express')?.directRequirementCount,
    ).toBe(2);
    expect(
      getGraphNodeDetails(graphWithDuplicateEdge, 'Skill:python')?.selectedTrackRequirement,
    ).toEqual({ importance: 'supporting', weight: 4, targetLevel: 'advanced' });
  });
});

describe('getGraphSemanticRanks', () => {
  it('places the role at the center, requirements next, prerequisite layers deeper, and projects outermost', () => {
    const ranks = getGraphSemanticRanks(nodes, edges);

    expect(ranks.get('Role:backend-developer')).toBe(5);
    expect(ranks.get('Skill:python')).toBe(4);
    expect(ranks.get('Skill:api-design')).toBe(4);
    expect(ranks.get('Skill:basics')).toBe(3);
    expect(ranks.get('Skill:logic')).toBe(2);
    expect(ranks.get('Skill:unrelated')).toBe(1);
    expect(ranks.get('Project:api-lab')).toBe(0);
    expect(ranks.get('Project:zeta-service')).toBe(0);
  });

  it('ignores cross edges with missing or incompatible endpoint node types', () => {
    const crossEdges: GraphEdge[] = [
      ...edges,
      {
        data: {
          id: 'project-requires-unrelated',
          source: 'Project:api-lab',
          target: 'Skill:unrelated',
          type: 'REQUIRES',
          label: 'REQUIRES',
        },
      },
      {
        data: {
          id: 'role-prerequisite-unrelated',
          source: 'Role:backend-developer',
          target: 'Skill:unrelated',
          type: 'PREREQUISITE_FOR',
          label: 'PREREQUISITE_FOR',
        },
      },
    ];

    expect(getGraphSemanticRanks(nodes, crossEdges).get('Skill:unrelated')).toBe(1);
  });

  it('places Track beside universal requirements and track-only requirements on the next ring', () => {
    const ranks = getGraphSemanticRanks(trackGraph.nodes, trackGraph.edges);

    expect(ranks.get('Role:backend-developer')).toBeGreaterThan(
      ranks.get('Track:node-express') ?? 0,
    );
    expect(ranks.get('Track:node-express')).toBe(ranks.get('Skill:python'));
    expect(ranks.get('Skill:python')).toBeGreaterThan(ranks.get('Skill:express') ?? 0);
    expect(ranks.get('Skill:express')).toBeGreaterThan(ranks.get('Project:api-lab') ?? 0);
  });
});
