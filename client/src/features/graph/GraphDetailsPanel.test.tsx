import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { GraphNodeDetails } from './graph-model';
import { GraphDetailsPanel } from './GraphDetailsPanel';

const roleDetails: GraphNodeDetails = {
  node: {
    id: 'Role:backend-developer',
    type: 'role',
    label: 'Backend Developer',
    slug: 'backend-developer',
    summary: 'Build reliable services.',
    category: 'Software Engineering',
    experienceLevel: 'Early career',
  },
  directRequirementCount: 2,
  prerequisites: [],
  projects: [],
  builtSkills: [],
};

const trackDetails: GraphNodeDetails = {
  node: {
    id: 'Track:node-express',
    type: 'track',
    label: 'Node.js and Express',
    slug: 'node-express',
    summary: 'Build production Node.js services.',
    description: 'Specialize in Express APIs, security and caching.',
    category: 'Backend',
    parentRoleSlug: 'backend-developer',
  },
  directRequirementCount: 3,
  parentRole: {
    id: 'Role:backend-developer',
    type: 'role',
    label: 'Backend Developer',
    slug: 'backend-developer',
  },
  prerequisites: [],
  projects: [],
  builtSkills: [],
};

const skillDetails: GraphNodeDetails = {
  node: {
    id: 'Skill:python',
    type: 'skill',
    label: 'Python',
    slug: 'python',
    description: 'Write maintainable Python services.',
    category: 'Programming Languages',
    difficulty: 'foundation',
    selected: true,
    missing: true,
  },
  selectedRoleRequirement: {
    importance: 'core',
    weight: 5,
    targetLevel: 'intermediate',
  },
  prerequisites: [
    {
      id: 'Skill:programming-basics',
      type: 'skill',
      label: 'Programming Basics',
      slug: 'programming-basics',
    },
  ],
  projects: [
    {
      id: 'Project:api-lab',
      type: 'project',
      label: 'API Lab',
      slug: 'api-lab',
    },
    {
      id: 'Project:service-starter',
      type: 'project',
      label: 'Service Starter',
      slug: 'service-starter',
    },
  ],
  builtSkills: [],
};

const projectDetails: GraphNodeDetails = {
  node: {
    id: 'Project:api-lab',
    type: 'project',
    label: 'API Lab',
    slug: 'api-lab',
    summary: 'Practice production API design.',
    category: 'Backend',
    difficulty: 'intermediate',
    estimatedHours: 8,
  },
  prerequisites: [],
  projects: [],
  builtSkills: [
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
  ],
};

describe('GraphDetailsPanel', () => {
  it('renders an accessible empty state when no node is selected', () => {
    render(<GraphDetailsPanel details={null} onClose={vi.fn()} />);

    const panel = screen.getByRole('complementary', { name: 'Selected node details' });
    expect(within(panel).getByRole('heading', { name: 'Select a node' })).toBeInTheDocument();
    expect(within(panel).getByText(/select any role, track, skill or project/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('shows role context and the direct requirement count derived from this graph', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<GraphDetailsPanel details={roleDetails} onClose={onClose} />);

    const panel = screen.getByRole('complementary', { name: 'Backend Developer details' });
    expect(within(panel).getByRole('heading', { name: 'Backend Developer' })).toBeInTheDocument();
    expect(within(panel).getByText('Build reliable services.')).toBeInTheDocument();
    expect(within(panel).getByText('Software Engineering')).toBeInTheDocument();
    expect(within(panel).getByText('Early career')).toBeInTheDocument();
    expect(within(panel).getByText('Direct requirements in this graph')).toBeInTheDocument();
    expect(within(panel).getByText('2 skills')).toBeInTheDocument();

    await user.click(
      within(panel).getByRole('button', { name: 'Close Backend Developer details' }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows a track description, parent role, and track-specific requirement count', () => {
    render(<GraphDetailsPanel details={trackDetails} onClose={vi.fn()} />);

    const panel = screen.getByRole('complementary', { name: 'Node.js and Express details' });
    expect(within(panel).getByText('Build production Node.js services.')).toBeInTheDocument();
    expect(
      within(panel).getByText('Specialize in Express APIs, security and caching.'),
    ).toBeInTheDocument();
    expect(within(panel).getByText('Parent role')).toBeInTheDocument();
    expect(within(panel).getByText('Backend Developer')).toBeInTheDocument();
    expect(within(panel).getByText('Track-specific requirements in this graph')).toBeInTheDocument();
    expect(within(panel).getByText('3 skills')).toBeInTheDocument();
  });

  it('shows selected-role metadata, incoming prerequisites, connected projects, and profile tags for a skill', () => {
    render(<GraphDetailsPanel details={skillDetails} onClose={vi.fn()} />);

    const panel = screen.getByRole('complementary', { name: 'Python details' });
    expect(
      within(panel).getByRole('heading', { name: 'Selected-role requirement in this graph' }),
    ).toBeInTheDocument();
    expect(within(panel).getByText('Core')).toBeInTheDocument();
    expect(within(panel).getByText('5 points')).toBeInTheDocument();
    expect(within(panel).getByText('Intermediate')).toBeInTheDocument();

    const prerequisites = within(panel).getByRole('list', {
      name: 'Incoming prerequisites in this graph',
    });
    expect(within(prerequisites).getByText('Programming Basics')).toBeInTheDocument();

    const projects = within(panel).getByRole('list', {
      name: 'Connected projects in this graph',
    });
    expect(within(projects).getByText('API Lab')).toBeInTheDocument();
    expect(within(projects).getByText('Service Starter')).toBeInTheDocument();

    const status = within(panel).getByLabelText('Profile status');
    expect(within(status).getByText('In your profile')).toBeInTheDocument();
    expect(within(status).getByText('Missing requirement')).toBeInTheDocument();
  });

  it('explains when a skill has no direct selected-role or incoming graph relationships', () => {
    render(
      <GraphDetailsPanel
        details={{
          ...skillDetails,
          node: { ...skillDetails.node, selected: false, missing: false },
          selectedRoleRequirement: undefined,
          prerequisites: [],
          projects: [],
        }}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        'This skill is not a direct requirement for the selected role in this graph.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No incoming prerequisites are shown for this skill in this graph.'),
    ).toBeInTheDocument();
    expect(screen.getByText('No projects build this skill in this graph.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Profile status')).not.toBeInTheDocument();
  });

  it('shows selected-track requirement metadata separately from universal role metadata', () => {
    render(
      <GraphDetailsPanel
        details={{
          ...skillDetails,
          selectedTrackRequirement: {
            importance: 'supporting',
            weight: 4,
            targetLevel: 'advanced',
          },
        }}
        onClose={vi.fn()}
      />,
    );

    const heading = screen.getByRole('heading', {
      name: 'Selected-track requirement in this graph',
    });
    const section = heading.closest('section');
    expect(section).not.toBeNull();
    expect(within(section as HTMLElement).getByText('Supporting')).toBeInTheDocument();
    expect(within(section as HTMLElement).getByText('4 points')).toBeInTheDocument();
    expect(within(section as HTMLElement).getByText('Advanced')).toBeInTheDocument();
  });

  it('shows project difficulty, effort, and the skills it builds in this graph', () => {
    render(<GraphDetailsPanel details={projectDetails} onClose={vi.fn()} />);

    const panel = screen.getByRole('complementary', { name: 'API Lab details' });
    expect(within(panel).getByText('Practice production API design.')).toBeInTheDocument();
    expect(within(panel).getByText('Intermediate')).toBeInTheDocument();
    expect(within(panel).getByText('8 hours')).toBeInTheDocument();

    const builtSkills = within(panel).getByRole('list', {
      name: 'Skills built by this project in this graph',
    });
    expect(within(builtSkills).getByText('API Design')).toBeInTheDocument();
    expect(within(builtSkills).getByText('Python')).toBeInTheDocument();
  });

  it('keeps zero-valued relationship and effort metadata visible', () => {
    render(
      <GraphDetailsPanel
        details={{
          ...skillDetails,
          selectedRoleRequirement: { weight: 0 },
        }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('0 points')).toBeInTheDocument();

    render(
      <GraphDetailsPanel
        details={{
          ...projectDetails,
          node: { ...projectDetails.node, label: 'Zero-effort Project', estimatedHours: 0 },
        }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('0 hours')).toBeInTheDocument();
  });
});
