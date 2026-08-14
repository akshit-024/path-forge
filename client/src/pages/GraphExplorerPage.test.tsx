import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import type { CareerGraphHandle } from '../features/graph/CareerGraph';
import type { GraphNode, GraphNodeType, GraphResponse, Role, Track } from '../types/domain';
import { PROFILE_KEY } from '../utils/storage';
import { GraphExplorerPage } from './GraphExplorerPage';

const apiMocks = vi.hoisted(() => ({
  getRoles: vi.fn<() => Promise<Role[]>>(),
  getRoleTracks: vi.fn<(roleSlug: string, signal?: AbortSignal) => Promise<Track[]>>(),
  getRoleGraph:
    vi.fn<
      (
        roleSlug: string,
        currentSkillSlugs: string[],
        targetTrackSlug?: string,
        signal?: AbortSignal,
      ) => Promise<GraphResponse>
    >(),
}));

const graphCommands = vi.hoisted(() => ({
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  fit: vi.fn(),
  resetLayout: vi.fn(),
  clearSelection: vi.fn(),
  exportPng: vi.fn<() => Blob | null>(),
  resize: vi.fn(),
}));

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    pathforgeApi: {
      getRoles: apiMocks.getRoles,
      getRoleTracks: apiMocks.getRoleTracks,
      getRoleGraph: apiMocks.getRoleGraph,
    },
  };
});

vi.mock('../features/graph/CareerGraph', async () => {
  const React = await import('react');
  interface MockGraphProps {
    nodes: GraphNode[];
    visibleTypes: Set<GraphNodeType>;
    selectedNodeId: string | null;
    onNodeSelect: (node: GraphNode['data'] | null) => void;
  }

  return {
    CareerGraph: React.forwardRef<CareerGraphHandle, MockGraphProps>(function MockCareerGraph(
      { nodes, visibleTypes, selectedNodeId, onNodeSelect },
      ref,
    ) {
      React.useImperativeHandle(ref, () => graphCommands);
      return (
        <div
          aria-label="Test career graph"
          data-selected-node={selectedNodeId ?? ''}
          data-visible-types={[...visibleTypes].sort().join(',')}
        >
          {nodes
            .filter(({ data }) => visibleTypes.has(data.type))
            .map(({ data }) => (
              <button
                type="button"
                key={data.id}
                onClick={() => onNodeSelect(data)}
                aria-label={`Select ${data.label} node`}
              >
                {data.label}
              </button>
            ))}
        </div>
      );
    }),
  };
});

const backendRole: Role = {
  slug: 'backend-developer',
  name: 'Backend Developer',
  summary: 'Build reliable APIs.',
  description: 'Design backend systems.',
  category: 'Software Engineering',
  experienceLevel: 'Early career',
};

const aiRole: Role = {
  slug: 'ai-engineer',
  name: 'AI Engineer',
  summary: 'Build production AI systems.',
  description: 'Develop applied AI products.',
  category: 'AI and Machine Learning',
  experienceLevel: 'Early career',
};

function graphFor(role: Role): GraphResponse {
  const roleId = `Role:${role.slug}`;
  return {
    role,
    track: null,
    nodes: [
      {
        data: {
          id: roleId,
          type: 'role',
          label: role.name,
          slug: role.slug,
          summary: role.summary,
          category: role.category,
        },
      },
      {
        data: {
          id: 'Skill:javascript',
          type: 'skill',
          label: 'JavaScript',
          slug: 'javascript',
          description: 'Program interactive applications.',
          category: 'Programming Languages',
          difficulty: 'foundation',
          missing: true,
        },
      },
      {
        data: {
          id: 'Skill:html',
          type: 'skill',
          label: 'HTML',
          slug: 'html',
          category: 'Frontend',
          difficulty: 'foundation',
          selected: true,
        },
      },
      {
        data: {
          id: 'Project:todo-app',
          type: 'project',
          label: 'Todo App',
          slug: 'todo-app',
          summary: 'Build a tested task application.',
          category: 'Web Applications',
          difficulty: 'foundation',
          estimatedHours: 8,
        },
      },
    ],
    edges: [
      {
        data: {
          id: `${role.slug}-requires-javascript`,
          source: roleId,
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
          id: 'html-prerequisite-javascript',
          source: 'Skill:html',
          target: 'Skill:javascript',
          type: 'PREREQUISITE_FOR',
          label: 'PREREQUISITE_FOR',
        },
      },
      {
        data: {
          id: 'todo-builds-javascript',
          source: 'Project:todo-app',
          target: 'Skill:javascript',
          type: 'BUILDS',
          label: 'BUILDS',
        },
      },
    ],
  };
}

const backendGraph = graphFor(backendRole);
const aiGraph = graphFor(aiRole);

const backendTrack: Track = {
  slug: 'node-express',
  name: 'Node.js and Express',
  summary: 'Build production Node.js services.',
  description: 'Specialize in Express APIs and service reliability.',
  category: 'Backend',
  parentRoleSlug: backendRole.slug,
};

const backendTrackGraph: GraphResponse = {
  ...backendGraph,
  track: backendTrack,
  nodes: [
    ...backendGraph.nodes,
    {
      data: {
        id: `Track:${backendTrack.slug}`,
        type: 'track',
        label: backendTrack.name,
        slug: backendTrack.slug,
        summary: backendTrack.summary,
        description: backendTrack.description,
        category: backendTrack.category,
        parentRoleSlug: backendRole.slug,
      },
    },
  ],
  edges: [
    ...backendGraph.edges,
    {
      data: {
        id: 'backend-has-node-express',
        source: `Role:${backendRole.slug}`,
        target: `Track:${backendTrack.slug}`,
        type: 'HAS_TRACK',
        label: 'HAS_TRACK',
      },
    },
    {
      data: {
        id: 'node-express-requires-javascript',
        source: `Track:${backendTrack.slug}`,
        target: 'Skill:javascript',
        type: 'REQUIRES',
        label: 'REQUIRES',
        importance: 'supporting',
        weight: 4,
        targetLevel: 'advanced',
      },
    },
  ],
};

function persistProfile(
  roleSlug: string | null = backendRole.slug,
  trackSlug: string | null = null,
) {
  window.localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      targetRoleSlug: roleSlug,
      targetTrackSlug: trackSlug,
      currentSkills: [{ skillSlug: 'html', proficiency: 'project' }],
    }),
  );
}

beforeEach(() => {
  apiMocks.getRoles.mockReset().mockResolvedValue([backendRole, aiRole]);
  apiMocks.getRoleTracks.mockReset().mockResolvedValue([]);
  apiMocks.getRoleGraph
    .mockReset()
    .mockImplementation((roleSlug) =>
      Promise.resolve(roleSlug === aiRole.slug ? aiGraph : backendGraph),
    );
  Object.values(graphCommands).forEach((command) => command.mockReset());
  graphCommands.exportPng.mockReturnValue(new Blob(['graph'], { type: 'image/png' }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GraphExplorerPage', () => {
  it('shows the no-role state and keeps graph commands disabled', async () => {
    render(<GraphExplorerPage />);

    expect(
      await screen.findByRole('heading', { name: 'Choose a role to reveal its graph' }),
    ).toBeInTheDocument();
    expect(apiMocks.getRoleGraph).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Export PNG' })).toBeDisabled();
  });

  it('filters nodes, exposes graph controls, and keeps reset separate from selection', async () => {
    persistProfile();
    const user = userEvent.setup();
    render(<GraphExplorerPage />);

    const graph = await screen.findByLabelText('Test career graph');
    expect(graph).toHaveAttribute('data-visible-types', 'project,role,skill,track');

    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    await user.click(screen.getByRole('button', { name: 'Zoom out' }));
    await user.click(screen.getByRole('button', { name: 'Fit' }));
    await user.click(screen.getByRole('button', { name: 'Reset layout' }));
    expect(graphCommands.zoomIn).toHaveBeenCalledOnce();
    expect(graphCommands.zoomOut).toHaveBeenCalledOnce();
    expect(graphCommands.fit).toHaveBeenCalledOnce();
    expect(graphCommands.resetLayout).toHaveBeenCalledOnce();
    expect(graphCommands.clearSelection).not.toHaveBeenCalled();

    await user.click(screen.getByRole('checkbox', { name: 'Projects' }));
    expect(screen.getByRole('checkbox', { name: 'Projects' })).not.toBeChecked();
    expect(graph).toHaveAttribute('data-visible-types', 'role,skill,track');
    expect(screen.queryByRole('button', { name: 'Select Todo App node' })).not.toBeInTheDocument();
  });

  it('derives selected skill details from relationships and clears the selection', async () => {
    persistProfile();
    const user = userEvent.setup();
    render(<GraphExplorerPage />);

    expect(await screen.findByText('Select a node')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Select JavaScript node' }));

    const panel = screen.getByLabelText('JavaScript details');
    expect(within(panel).getByText('Core')).toBeInTheDocument();
    expect(within(panel).getByText('5 points')).toBeInTheDocument();
    expect(within(panel).getByText('Intermediate')).toBeInTheDocument();
    expect(within(panel).getByRole('list', { name: /Incoming prerequisites/ })).toHaveTextContent(
      'HTML',
    );
    expect(within(panel).getByRole('list', { name: /Connected projects/ })).toHaveTextContent(
      'Todo App',
    );

    const clearButton = screen.getByRole('button', { name: 'Clear selection' });
    expect(clearButton).toBeEnabled();
    await user.click(clearButton);
    expect(graphCommands.clearSelection).toHaveBeenCalledOnce();
    expect(screen.getByText('Select a node')).toBeInTheDocument();
  });

  it('selects a specialization track, preserves skills, exposes its node, and returns to General role', async () => {
    persistProfile();
    apiMocks.getRoleTracks.mockResolvedValue([backendTrack]);
    apiMocks.getRoleGraph.mockImplementation((_roleSlug, _skillSlugs, trackSlug) =>
      Promise.resolve(trackSlug === backendTrack.slug ? backendTrackGraph : backendGraph),
    );
    const user = userEvent.setup();
    render(<GraphExplorerPage />);

    const trackSelect = await screen.findByLabelText('Specialization track');
    expect(await within(trackSelect).findByRole('option', { name: backendTrack.name })).toHaveValue(
      backendTrack.slug,
    );
    expect(trackSelect).toHaveValue('');

    await user.selectOptions(trackSelect, backendTrack.slug);

    expect(
      await screen.findByText(`${backendRole.name} \u00b7 ${backendTrack.name} neighborhood`),
    ).toBeInTheDocument();
    expect(apiMocks.getRoleGraph).toHaveBeenLastCalledWith(
      backendRole.slug,
      ['html'],
      backendTrack.slug,
      expect.any(AbortSignal),
    );
    expect(screen.getByRole('checkbox', { name: 'Tracks' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: `Select ${backendTrack.name} node` }));
    const panel = screen.getByLabelText(`${backendTrack.name} details`);
    expect(within(panel).getByText('Parent role')).toBeInTheDocument();
    expect(within(panel).getByText(backendRole.name)).toBeInTheDocument();
    expect(
      within(panel).getByText('Track-specific requirements in this graph'),
    ).toBeInTheDocument();
    expect(within(panel).getByText('1 skill')).toBeInTheDocument();

    await user.selectOptions(trackSelect, '');

    expect(await screen.findByText(`${backendRole.name} neighborhood`)).toBeInTheDocument();
    expect(apiMocks.getRoleGraph).toHaveBeenLastCalledWith(
      backendRole.slug,
      ['html'],
      undefined,
      expect.any(AbortSignal),
    );
    expect(
      screen.queryByRole('button', { name: `Select ${backendTrack.name} node` }),
    ).not.toBeInTheDocument();
  });

  it('supports expanded mode, Escape, and a downloadable PNG action', async () => {
    persistProfile();
    const createObjectUrl = vi.fn(() => 'blob:pathforge-graph');
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrl,
    });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<GraphExplorerPage />);
    await screen.findByLabelText('Test career graph');

    const expandButton = screen.getByRole('button', { name: 'Expand canvas' });
    await user.click(expandButton);
    expect(screen.getByRole('button', { name: 'Exit expanded view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Expand canvas' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await user.click(screen.getByRole('button', { name: 'Export PNG' }));
    expect(graphCommands.exportPng).toHaveBeenCalledOnce();
    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchorClick).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:pathforge-graph');
    expect(screen.getByRole('status')).toHaveTextContent('Graph image downloaded.');
  });

  it('shows loading, database-error, retry, and empty graph states honestly', async () => {
    persistProfile();
    apiMocks.getRoleGraph
      .mockRejectedValueOnce(
        new ApiError('CognoDB is not configured.', 503, 'DATABASE_NOT_CONFIGURED'),
      )
      .mockResolvedValueOnce({ ...backendGraph, nodes: [], edges: [] });
    const user = userEvent.setup();
    render(<GraphExplorerPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Career graph setup needed');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(
      await screen.findByRole('heading', { name: 'This role has no graph neighborhood yet' }),
    ).toBeInTheDocument();
    expect(apiMocks.getRoleGraph).toHaveBeenCalledTimes(2);
  });

  it('keeps rendering the role graph during a partial track-list error', async () => {
    persistProfile();
    apiMocks.getRoleTracks.mockRejectedValueOnce(
      new ApiError('Track catalog unavailable.', 503, 'DATABASE_UNAVAILABLE'),
    );
    const user = userEvent.setup();
    render(<GraphExplorerPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Specialization tracks unavailable');
    expect(await screen.findByLabelText('Test career graph')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Select JavaScript node' }));
    expect(screen.getByLabelText('JavaScript details')).toBeInTheDocument();
    expect(apiMocks.getRoleGraph).toHaveBeenCalledTimes(1);
  });

  it('ignores a late graph response after the target role changes', async () => {
    persistProfile();
    let resolveBackend: (graph: GraphResponse) => void = () => undefined;
    const delayedBackend = new Promise<GraphResponse>((resolve) => {
      resolveBackend = resolve;
    });
    apiMocks.getRoleGraph.mockImplementation((roleSlug) =>
      roleSlug === backendRole.slug ? delayedBackend : Promise.resolve(aiGraph),
    );
    const user = userEvent.setup();
    render(<GraphExplorerPage />);

    await screen.findByRole('status', { name: 'Loading graph data' });
    await user.selectOptions(await screen.findByLabelText('Role neighborhood'), aiRole.slug);
    expect(await screen.findByText('AI Engineer neighborhood')).toBeInTheDocument();

    await act(async () => {
      resolveBackend(backendGraph);
      await delayedBackend;
    });

    await waitFor(() => expect(screen.getByText('AI Engineer neighborhood')).toBeInTheDocument());
    expect(screen.queryByText('Backend Developer neighborhood')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select AI Engineer node' })).toBeInTheDocument();
  });

  it('clears the old track graph immediately and ignores its late response after choosing General role', async () => {
    persistProfile(backendRole.slug, backendTrack.slug);
    apiMocks.getRoleTracks.mockResolvedValue([backendTrack]);
    let resolveTrackGraph: (graph: GraphResponse) => void = () => undefined;
    const delayedTrackGraph = new Promise<GraphResponse>((resolve) => {
      resolveTrackGraph = resolve;
    });
    apiMocks.getRoleGraph.mockImplementation((_roleSlug, _skillSlugs, trackSlug) =>
      trackSlug ? delayedTrackGraph : Promise.resolve(backendGraph),
    );
    const user = userEvent.setup();
    render(<GraphExplorerPage />);

    const trackSelect = await screen.findByLabelText('Specialization track');
    await waitFor(() => expect(trackSelect).toHaveValue(backendTrack.slug));
    expect(screen.queryByLabelText('Test career graph')).not.toBeInTheDocument();

    await user.selectOptions(trackSelect, '');
    expect(await screen.findByText(`${backendRole.name} neighborhood`)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: `Select ${backendTrack.name} node` }),
    ).not.toBeInTheDocument();

    await act(async () => {
      resolveTrackGraph(backendTrackGraph);
      await delayedTrackGraph;
    });

    expect(screen.getByText(`${backendRole.name} neighborhood`)).toBeInTheDocument();
    expect(trackSelect).toHaveValue('');
    expect(
      screen.queryByRole('button', { name: `Select ${backendTrack.name} node` }),
    ).not.toBeInTheDocument();
  });
});
