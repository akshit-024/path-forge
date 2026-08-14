import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import type {
  AnalysisRequest,
  AnalysisResult,
  AssessedRequirement,
  Role,
  RoleRequirementsResponse,
  Skill,
  Track,
} from '../types/domain';
import { loadProfile, PROFILE_KEY } from '../utils/storage';
import { PlannerPage } from './PlannerPage';

const apiMocks = vi.hoisted(() => ({
  getRoles: vi.fn<() => Promise<Role[]>>(),
  getSkills: vi.fn<() => Promise<Skill[]>>(),
  analyze: vi.fn<(input: AnalysisRequest, signal?: AbortSignal) => Promise<AnalysisResult>>(),
  getHealth: vi.fn(),
  getRoleTracks: vi.fn<(roleSlug: string, signal?: AbortSignal) => Promise<Track[]>>(),
  getRoleRequirements:
    vi.fn<
      (
        roleSlug: string,
        trackSlug?: string,
        signal?: AbortSignal,
      ) => Promise<RoleRequirementsResponse>
    >(),
}));

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, pathforgeApi: apiMocks };
});

const backendRole: Role = {
  slug: 'backend-developer',
  name: 'Backend Developer',
  summary: 'Build reliable APIs and services.',
  description: 'Design and maintain backend systems.',
  category: 'Software Engineering',
  experienceLevel: 'Early career',
};

const aiRole: Role = {
  slug: 'ai-engineer',
  name: 'AI Engineer',
  summary: 'Build production AI systems.',
  description: 'Develop and operate applied AI products.',
  category: 'AI and Machine Learning',
  experienceLevel: 'Early career',
};

const frontendRole: Role = {
  slug: 'frontend-developer',
  name: 'Frontend Developer',
  summary: 'Build accessible web interfaces.',
  description: 'Create maintainable frontend experiences.',
  category: 'Software Engineering',
  experienceLevel: 'Early career',
};

const python: Skill = {
  slug: 'python',
  name: 'Python',
  description: 'A general-purpose programming language.',
  category: 'Programming Languages',
  difficulty: 'foundation',
};

const sql: Skill = {
  slug: 'sql',
  name: 'SQL',
  description: 'Query and transform relational data.',
  category: 'Databases',
  difficulty: 'foundation',
};

const javascript: Skill = {
  slug: 'javascript',
  name: 'JavaScript',
  description: 'Program interactive applications.',
  category: 'Programming Languages',
  difficulty: 'foundation',
};

const git: Skill = {
  slug: 'git',
  name: 'Git',
  description: 'Track and review source changes.',
  category: 'Developer Tools',
  difficulty: 'foundation',
};

const react: Skill = {
  slug: 'react',
  name: 'React',
  description: 'Build component-based interfaces.',
  category: 'Frontend',
  difficulty: 'intermediate',
};

const machineLearning: Skill = {
  slug: 'machine-learning',
  name: 'Machine Learning',
  description: 'Train predictive models.',
  category: 'AI and Machine Learning',
  difficulty: 'advanced',
};

const pandas: Skill = {
  slug: 'pandas',
  name: 'Pandas',
  description: 'Transform tabular data.',
  category: 'Data Analytics',
  difficulty: 'intermediate',
};

const stateManagement: Skill = {
  slug: 'state-management',
  name: 'State Management',
  description: 'Manage shared client application state.',
  category: 'Frontend',
  difficulty: 'intermediate',
};

function roleRequirements(
  role: Role,
  requirements: Array<{
    skill: Skill;
    importance: 'core' | 'supporting';
    weight: number;
    targetLevel: 'foundation' | 'intermediate' | 'advanced';
  }>,
  track: Track | null = null,
): RoleRequirementsResponse {
  return {
    role,
    track,
    requirements: requirements.map(({ skill, importance, weight, targetLevel }) => ({
      ...skill,
      importance,
      weight,
      targetLevel,
    })),
  };
}

const backendRequirements = roleRequirements(backendRole, [
  { skill: python, importance: 'core', weight: 5, targetLevel: 'intermediate' },
  { skill: sql, importance: 'supporting', weight: 3, targetLevel: 'foundation' },
]);
const frontendRequirements = roleRequirements(frontendRole, [
  { skill: javascript, importance: 'core', weight: 5, targetLevel: 'intermediate' },
  { skill: react, importance: 'core', weight: 5, targetLevel: 'intermediate' },
  { skill: git, importance: 'supporting', weight: 3, targetLevel: 'foundation' },
]);
const aiRequirements = roleRequirements(aiRole, [
  { skill: python, importance: 'core', weight: 5, targetLevel: 'intermediate' },
  { skill: machineLearning, importance: 'core', weight: 5, targetLevel: 'advanced' },
  { skill: git, importance: 'supporting', weight: 2, targetLevel: 'foundation' },
]);

const reactTrack: Track = {
  slug: 'react',
  name: 'React',
  summary: 'Build production interfaces with React.',
  description: 'Specialize in React application architecture.',
  category: 'Frontend',
  parentRoleSlug: frontendRole.slug,
};

const llmTrack: Track = {
  slug: 'llm-rag',
  name: 'LLM and RAG',
  summary: 'Build grounded language-model applications.',
  description: 'Specialize in retrieval-augmented generation systems.',
  category: 'AI and Machine Learning',
  parentRoleSlug: aiRole.slug,
};

const fastApiTrack: Track = {
  slug: 'python-fastapi',
  name: 'Python and FastAPI',
  summary: 'Build typed Python APIs with FastAPI.',
  description: 'Specialize in asynchronous Python services.',
  category: 'Backend',
  parentRoleSlug: backendRole.slug,
};

const frontendReactRequirements = roleRequirements(
  frontendRole,
  [
    { skill: javascript, importance: 'core', weight: 5, targetLevel: 'intermediate' },
    { skill: react, importance: 'core', weight: 5, targetLevel: 'intermediate' },
    { skill: stateManagement, importance: 'core', weight: 4, targetLevel: 'intermediate' },
    { skill: git, importance: 'supporting', weight: 3, targetLevel: 'foundation' },
  ],
  reactTrack,
);

const restApis: AssessedRequirement = {
  slug: 'rest-apis',
  name: 'REST APIs',
  description: 'Design resource-oriented HTTP APIs.',
  category: 'Backend',
  difficulty: 'intermediate',
  importance: 'core',
  weight: 5,
  targetLevel: 'intermediate',
  selected: false,
  proficiency: null,
  factor: 0,
  contribution: 0,
};

const assessedPython: AssessedRequirement = {
  ...python,
  importance: 'core',
  weight: 5,
  targetLevel: 'intermediate',
  selected: true,
  proficiency: 'project',
  factor: 1,
  contribution: 5,
};

const backendAnalysis: AnalysisResult = {
  targetRole: backendRole,
  targetTrack: null,
  readinessPercentage: 50,
  assessedRequirements: [assessedPython, restApis],
  demonstratedSkills: [assessedPython],
  comfortableSkills: [],
  developingSkills: [],
  matchedSkills: [assessedPython],
  missingSkills: [restApis],
  coreMissingSkills: [restApis],
  supportingMissingSkills: [],
  learningPaths: [],
  recommendedProjects: [],
  similarRoles: [
    {
      role: aiRole,
      sharedSkillCount: 1,
      sharedSkills: [{ slug: 'python', name: 'Python', weight: 5 }],
      sharedWeight: 5,
      explanation: 'AI Engineer shares Python with the target role.',
    },
  ],
  explanation: {
    matchedWeight: 5,
    earnedWeight: 5,
    totalWeight: 10,
    formula: 'matched / total × 100',
    selectedSkillCount: 2,
    proficiencyFactors: { learning: 0.35, comfortable: 0.7, project: 1 },
    calculations: [
      {
        skillSlug: 'python',
        skillName: 'Python',
        weight: 5,
        proficiency: 'project',
        factor: 1,
        contribution: 5,
      },
      {
        skillSlug: 'rest-apis',
        skillName: 'REST APIs',
        weight: 5,
        proficiency: null,
        factor: 0,
        contribution: 0,
      },
    ],
  },
};

const frontendReactAnalysis: AnalysisResult = {
  ...backendAnalysis,
  targetRole: frontendRole,
  targetTrack: reactTrack,
};

const frontendGeneralAnalysis: AnalysisResult = {
  ...backendAnalysis,
  targetRole: frontendRole,
  targetTrack: null,
};

function persistExistingProfile(
  targetRoleSlug = backendRole.slug,
  currentSkillSlugs = [python.slug, sql.slug],
) {
  window.localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      targetRoleSlug,
      targetTrackSlug: null,
      currentSkills: currentSkillSlugs.map((skillSlug) => ({
        skillSlug,
        proficiency: 'project',
      })),
    }),
  );
}

function renderPlanner() {
  return render(
    <MemoryRouter>
      <PlannerPage />
    </MemoryRouter>,
  );
}

async function renderCompletedAnalysis() {
  persistExistingProfile();
  const user = userEvent.setup();
  renderPlanner();
  const analyzeButton = await screen.findByRole('button', { name: 'Analyze my readiness' });
  await waitFor(() => expect(analyzeButton).toBeEnabled());
  await user.click(analyzeButton);
  await screen.findByRole('img', { name: '50% weighted readiness' });
  expect(apiMocks.analyze).toHaveBeenCalledWith(
    {
      targetRoleSlug: 'backend-developer',
      currentSkills: [
        { skillSlug: 'python', proficiency: 'project' },
        { skillSlug: 'sql', proficiency: 'project' },
      ],
    },
    expect.any(AbortSignal),
  );
  return user;
}

beforeEach(() => {
  window.localStorage.clear();
  apiMocks.getRoles.mockReset().mockResolvedValue([backendRole, frontendRole, aiRole]);
  apiMocks.getSkills
    .mockReset()
    .mockResolvedValue([
      python,
      sql,
      javascript,
      git,
      react,
      machineLearning,
      pandas,
      stateManagement,
    ]);
  apiMocks.getRoleTracks.mockReset().mockImplementation((roleSlug) => {
    const tracks = {
      'backend-developer': [fastApiTrack],
      'frontend-developer': [reactTrack],
      'ai-engineer': [llmTrack],
    }[roleSlug];
    return tracks ? Promise.resolve(tracks) : Promise.reject(new Error('Unknown role'));
  });
  apiMocks.getRoleRequirements.mockReset().mockImplementation((roleSlug, trackSlug) => {
    if (roleSlug === frontendRole.slug && trackSlug === reactTrack.slug) {
      return Promise.resolve(frontendReactRequirements);
    }
    const response = {
      'backend-developer': backendRequirements,
      'frontend-developer': frontendRequirements,
      'ai-engineer': aiRequirements,
    }[roleSlug];
    return response ? Promise.resolve(response) : Promise.reject(new Error('Unknown role'));
  });
  apiMocks.analyze.mockReset().mockResolvedValue(backendAnalysis);
});

describe('Planner role navigation', () => {
  it('shows only graph-connected Frontend requirements and updates them for AI Engineer', async () => {
    persistExistingProfile(frontendRole.slug, []);
    const user = userEvent.setup();
    renderPlanner();

    const javascriptControl = await screen.findByRole('checkbox', { name: 'JavaScript' });
    const roleContext = screen.getByRole('region', { name: 'Frontend Developer' });
    expect(roleContext).toHaveTextContent('Software Engineering');
    expect(roleContext).toHaveTextContent('Build accessible web interfaces.');
    expect(within(roleContext).getByText('3')).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'Planner analysis actions' }),
    ).toHaveTextContent('Frontend Developer · 0 of 3 requirements selected');
    const frontendRequirements = screen
      .getByRole('heading', { name: 'Required for this role' })
      .closest('section');
    expect(frontendRequirements).not.toBeNull();
    expect(
      within(frontendRequirements as HTMLElement).getByRole('checkbox', { name: 'Git' }),
    ).toBeInTheDocument();
    expect(
      within(frontendRequirements as HTMLElement).getByRole('checkbox', { name: 'React' }),
    ).toBeInTheDocument();
    expect(
      within(frontendRequirements as HTMLElement).queryByText('Machine Learning'),
    ).not.toBeInTheDocument();
    expect(
      within(frontendRequirements as HTMLElement).queryByText('Pandas'),
    ).not.toBeInTheDocument();

    await user.click(javascriptControl);
    await user.click(screen.getByRole('button', { name: 'Change role' }));
    await user.click(screen.getByRole('radio', { name: /AI Engineer/ }));
    await user.click(screen.getByRole('button', { name: 'Continue to skills' }));

    const machineLearningControl = await screen.findByRole('checkbox', {
      name: 'Machine Learning',
    });
    const aiRequirements = screen
      .getByRole('heading', { name: 'Required for this role' })
      .closest('section');
    expect(machineLearningControl).toBeInTheDocument();
    expect(
      within(aiRequirements as HTMLElement).getByRole('checkbox', { name: 'Python' }),
    ).toBeInTheDocument();
    expect(
      within(aiRequirements as HTMLElement).queryByRole('checkbox', { name: 'JavaScript' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Not used in the current role score: JavaScript/)).toBeInTheDocument();
    await waitFor(() => {
      expect(loadProfile()).toEqual({
        targetRoleSlug: 'ai-engineer',
        targetTrackSlug: null,
        currentSkills: [{ skillSlug: 'javascript', proficiency: 'learning' }],
      });
    });
  });

  it('shows explicit General and specialization options with combined requirements', async () => {
    persistExistingProfile(frontendRole.slug, ['javascript']);
    const user = userEvent.setup();
    renderPlanner();

    const generalOption = await screen.findByRole('radio', { name: /General role/ });
    expect(generalOption).toBeChecked();
    expect(
      screen.getByText(/assesses both the universal Frontend Developer requirements/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /React.*Build production interfaces/ }));

    expect(await screen.findByRole('checkbox', { name: 'State Management' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'JavaScript' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Frontend Developer' })).toHaveTextContent(
      'React specialization',
    );
    expect(apiMocks.getRoleRequirements).toHaveBeenLastCalledWith(
      frontendRole.slug,
      reactTrack.slug,
      expect.any(AbortSignal),
    );
    await waitFor(() => {
      expect(loadProfile()).toEqual({
        targetRoleSlug: frontendRole.slug,
        targetTrackSlug: reactTrack.slug,
        currentSkills: [{ skillSlug: 'javascript', proficiency: 'project' }],
      });
    });
  });

  it('preserves the existing flow for a role without specialization tracks', async () => {
    apiMocks.getRoleTracks.mockImplementation((roleSlug) =>
      Promise.resolve(roleSlug === backendRole.slug ? [] : [reactTrack]),
    );
    persistExistingProfile(backendRole.slug, ['python']);
    renderPlanner();

    expect(await screen.findByRole('checkbox', { name: 'Python' })).toBeChecked();
    expect(screen.queryByRole('radio', { name: /General role/ })).not.toBeInTheDocument();
    expect(apiMocks.getRoleRequirements).toHaveBeenCalledWith(
      backendRole.slug,
      undefined,
      expect.any(AbortSignal),
    );
  });

  it('handles a saved specialization that no longer belongs to the selected role', async () => {
    window.localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({
        targetRoleSlug: frontendRole.slug,
        targetTrackSlug: 'retired-track',
        currentSkills: [{ skillSlug: 'javascript', proficiency: 'project' }],
      }),
    );
    const user = userEvent.setup();
    renderPlanner();

    expect(await screen.findByText('Specialization not found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze my readiness' })).toBeDisabled();
    expect(apiMocks.getRoleRequirements).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Use General role' }));
    expect(await screen.findByRole('checkbox', { name: 'JavaScript' })).toBeChecked();
    await waitFor(() => expect(loadProfile().targetTrackSlug).toBeNull());
  });

  it('does not show stale requirements when roles change rapidly', async () => {
    persistExistingProfile(frontendRole.slug, ['javascript']);
    let resolveFrontendRequirements: (response: RoleRequirementsResponse) => void = () => undefined;
    const delayedFrontendRequirements = new Promise<RoleRequirementsResponse>((resolve) => {
      resolveFrontendRequirements = resolve;
    });
    apiMocks.getRoleRequirements.mockImplementation((roleSlug) =>
      roleSlug === frontendRole.slug
        ? delayedFrontendRequirements
        : Promise.resolve(aiRequirements),
    );
    const user = userEvent.setup();
    renderPlanner();

    expect(
      await screen.findByRole('status', { name: 'Loading Frontend Developer requirements' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to target role selection' }));
    await user.click(screen.getByRole('radio', { name: /AI Engineer/ }));
    await user.click(screen.getByRole('button', { name: 'Continue to skills' }));
    await screen.findByRole('checkbox', { name: 'Machine Learning' });

    await act(async () => {
      resolveFrontendRequirements(frontendRequirements);
      await delayedFrontendRequirements;
    });

    const requiredSection = screen
      .getByRole('heading', { name: 'Required for this role' })
      .closest('section');
    expect(
      within(requiredSection as HTMLElement).getByRole('checkbox', { name: 'Machine Learning' }),
    ).toBeInTheDocument();
    expect(
      within(requiredSection as HTMLElement).queryByRole('checkbox', { name: 'JavaScript' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Not used in the current role score: JavaScript/)).toBeInTheDocument();
  });

  it('shows specialization loading and retries a safe track-list error', async () => {
    persistExistingProfile(frontendRole.slug, []);
    let rejectTracks: (error: unknown) => void = () => undefined;
    apiMocks.getRoleTracks.mockReturnValueOnce(
      new Promise<Track[]>((_resolve, reject) => {
        rejectTracks = reject;
      }),
    );
    const user = userEvent.setup();
    renderPlanner();

    expect(
      await screen.findByRole('status', {
        name: 'Loading specializations for Frontend Developer',
      }),
    ).toBeInTheDocument();
    expect(apiMocks.getRoleRequirements).not.toHaveBeenCalled();

    await act(async () => {
      rejectTracks(new ApiError('CognoDB could not be reached.', 503, 'DATABASE_UNAVAILABLE'));
      await Promise.resolve();
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Career graph unavailable');

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('checkbox', { name: 'JavaScript' })).toBeInTheDocument();
    expect(apiMocks.getRoleTracks).toHaveBeenCalledTimes(2);
  });

  it('shows role-requirement loading and empty states without enabling analysis', async () => {
    persistExistingProfile(frontendRole.slug, []);
    let resolveRequirements: (response: RoleRequirementsResponse) => void = () => undefined;
    apiMocks.getRoleRequirements.mockReturnValueOnce(
      new Promise<RoleRequirementsResponse>((resolve) => {
        resolveRequirements = resolve;
      }),
    );
    renderPlanner();

    expect(
      await screen.findByRole('status', { name: 'Loading Frontend Developer requirements' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze my readiness' })).toBeDisabled();
    expect(apiMocks.analyze).not.toHaveBeenCalled();

    await act(async () => {
      resolveRequirements(roleRequirements(frontendRole, []));
      await Promise.resolve();
    });

    expect(
      await screen.findByText('No requirements mapped for Frontend Developer'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze my readiness' })).toBeDisabled();
  });

  it('shows a database requirement error and retries safely', async () => {
    persistExistingProfile(frontendRole.slug, []);
    apiMocks.getRoleRequirements.mockRejectedValueOnce(
      new ApiError('CognoDB could not be reached.', 503, 'DATABASE_UNAVAILABLE'),
    );
    const user = userEvent.setup();
    renderPlanner();

    expect(await screen.findByRole('alert')).toHaveTextContent('Career graph unavailable');
    expect(screen.getByRole('button', { name: 'Analyze my readiness' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('checkbox', { name: 'JavaScript' })).toBeInTheDocument();
    expect(apiMocks.getRoleRequirements).toHaveBeenCalledTimes(2);
  });

  it('shows the existing unknown-role error state for a missing requirement graph', async () => {
    persistExistingProfile(frontendRole.slug, []);
    apiMocks.getRoleRequirements.mockRejectedValueOnce(
      new ApiError('No role was found.', 404, 'NOT_FOUND'),
    );
    renderPlanner();

    expect(await screen.findByRole('alert')).toHaveTextContent('Role not found');
    expect(screen.getByRole('button', { name: 'Analyze my readiness' })).toBeDisabled();
  });

  it('changes the target role while preserving current skills', async () => {
    const user = await renderCompletedAnalysis();

    await user.click(screen.getByRole('button', { name: 'Change target role' }));

    expect(
      screen.getByRole('heading', { name: 'Choose the role you want to reach' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '50% weighted readiness' })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(loadProfile()).toEqual({
        targetRoleSlug: null,
        targetTrackSlug: null,
        currentSkills: [
          { skillSlug: 'python', proficiency: 'project' },
          { skillSlug: 'sql', proficiency: 'project' },
        ],
      });
    });

    await user.click(screen.getByRole('radio', { name: /AI Engineer/ }));
    await user.click(screen.getByRole('button', { name: 'Continue to skills' }));

    expect(
      screen.getByRole('heading', { name: 'Select your current skills for AI Engineer' }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('checkbox', { name: 'Python' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByText(/Not used in the current role score: SQL/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Other skills in your profile/ }));
    expect(
      screen.getByRole('checkbox', { name: 'SQL, not used in the current role score' }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('starts a new plan by clearing the target, skills, result, and persisted profile', async () => {
    const user = await renderCompletedAnalysis();

    await user.click(screen.getByRole('button', { name: 'Start new plan' }));

    expect(
      screen.getByRole('heading', { name: 'Choose the role you want to reach' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '50% weighted readiness' })).not.toBeInTheDocument();
    await waitFor(() => expect(window.localStorage.getItem(PROFILE_KEY)).toBeNull());

    await user.click(screen.getByRole('radio', { name: /AI Engineer/ }));
    await user.click(screen.getByRole('button', { name: 'Continue to skills' }));

    expect(await screen.findByRole('checkbox', { name: 'Python' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await user.click(screen.getByRole('button', { name: /Other skills in your profile/ }));
    expect(
      screen.getByRole('checkbox', { name: 'SQL, not used in the current role score' }),
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('navigates from Step 3 to target role and current skills with accessible progress buttons', async () => {
    const user = await renderCompletedAnalysis();
    const progress = within(screen.getByRole('list', { name: 'Planner progress' }));

    await user.click(progress.getByRole('button', { name: 'Go to step 1: Target role' }));
    expect(
      screen.getByRole('heading', { name: 'Choose the role you want to reach' }),
    ).toBeInTheDocument();

    await user.click(progress.getByRole('button', { name: 'Go to step 3: Your route' }));
    expect(screen.getByRole('img', { name: '50% weighted readiness' })).toBeInTheDocument();

    const currentSkills = progress.getByRole('button', {
      name: 'Go to step 2: Current skills',
    });
    currentSkills.focus();
    expect(currentSkills).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(
      screen.getByRole('heading', { name: 'Select your current skills for Backend Developer' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '50% weighted readiness' })).not.toBeInTheDocument();
  });

  it('uses a similar role as the next target without submitting automatically', async () => {
    const user = await renderCompletedAnalysis();

    await user.click(screen.getByRole('button', { name: 'Use AI Engineer as target role' }));

    expect(
      screen.getByRole('heading', { name: 'Select your current skills for AI Engineer' }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('checkbox', { name: 'Python' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByText(/Not used in the current role score: SQL/)).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '50% weighted readiness' })).not.toBeInTheDocument();
    expect(apiMocks.analyze).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(loadProfile()).toEqual({
        targetRoleSlug: 'ai-engineer',
        targetTrackSlug: null,
        currentSkills: [
          { skillSlug: 'python', proficiency: 'project' },
          { skillSlug: 'sql', proficiency: 'project' },
        ],
      });
    });
  });

  it('preserves skills, clears an in-flight result, and sends the selected track in analysis', async () => {
    persistExistingProfile(frontendRole.slug, ['javascript']);
    let resolveGeneralAnalysis: (analysis: AnalysisResult) => void = () => undefined;
    const delayedGeneralAnalysis = new Promise<AnalysisResult>((resolve) => {
      resolveGeneralAnalysis = resolve;
    });
    apiMocks.analyze
      .mockReset()
      .mockReturnValueOnce(delayedGeneralAnalysis)
      .mockResolvedValueOnce(frontendReactAnalysis);
    const user = userEvent.setup();
    renderPlanner();

    const analyzeButton = await screen.findByRole('button', { name: 'Analyze my readiness' });
    await waitFor(() => expect(analyzeButton).toBeEnabled());
    await user.click(analyzeButton);
    expect(screen.getByRole('button', { name: 'Analyzing your route…' })).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: /React.*Build production interfaces/ }));
    expect(await screen.findByRole('checkbox', { name: 'JavaScript' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(await screen.findByRole('checkbox', { name: 'State Management' })).toBeInTheDocument();

    await act(async () => {
      resolveGeneralAnalysis(frontendGeneralAnalysis);
      await delayedGeneralAnalysis;
    });
    expect(screen.queryByRole('img', { name: '50% weighted readiness' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Analyze my readiness' }));
    expect(await screen.findByText('React specialization')).toBeInTheDocument();
    expect(apiMocks.analyze).toHaveBeenLastCalledWith(
      {
        targetRoleSlug: frontendRole.slug,
        targetTrackSlug: reactTrack.slug,
        currentSkills: [{ skillSlug: 'javascript', proficiency: 'project' }],
      },
      expect.any(AbortSignal),
    );
  });

  it('ignores a stale analysis response after the target role changes', async () => {
    persistExistingProfile();
    let resolveOldAnalysis: (analysis: AnalysisResult) => void = () => undefined;
    const oldAnalysis = new Promise<AnalysisResult>((resolve) => {
      resolveOldAnalysis = resolve;
    });
    apiMocks.analyze.mockReturnValueOnce(oldAnalysis);
    const user = userEvent.setup();
    renderPlanner();

    const analyzeButton = await screen.findByRole('button', { name: 'Analyze my readiness' });
    await waitFor(() => expect(analyzeButton).toBeEnabled());
    await user.click(analyzeButton);
    expect(screen.getByRole('button', { name: 'Analyzing your route…' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Change role' }));
    await user.click(screen.getByRole('radio', { name: /AI Engineer/ }));
    await user.click(screen.getByRole('button', { name: 'Continue to skills' }));

    await act(async () => {
      resolveOldAnalysis(backendAnalysis);
      await oldAnalysis;
    });

    expect(
      screen.getByRole('heading', { name: 'Select your current skills for AI Engineer' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '50% weighted readiness' })).not.toBeInTheDocument();
    expect(screen.queryByText('Your route to Backend Developer')).not.toBeInTheDocument();
  });

  it('clears an in-flight result when proficiency changes and sends the updated profile', async () => {
    persistExistingProfile(backendRole.slug, ['python']);
    let resolveOldAnalysis: (analysis: AnalysisResult) => void = () => undefined;
    const oldAnalysis = new Promise<AnalysisResult>((resolve) => {
      resolveOldAnalysis = resolve;
    });
    apiMocks.analyze
      .mockReset()
      .mockReturnValueOnce(oldAnalysis)
      .mockResolvedValueOnce(backendAnalysis);
    const user = userEvent.setup();
    renderPlanner();

    const analyzeButton = await screen.findByRole('button', { name: 'Analyze my readiness' });
    await waitFor(() => expect(analyzeButton).toBeEnabled());
    await user.click(analyzeButton);
    expect(screen.getByRole('button', { name: /Analyzing your route/ })).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: 'Comfortable proficiency for Python, 70% contribution factor',
      }),
    );
    expect(screen.getByRole('button', { name: 'Analyze my readiness' })).toBeEnabled();

    await act(async () => {
      resolveOldAnalysis(backendAnalysis);
      await oldAnalysis;
    });
    expect(screen.queryByRole('img', { name: '50% weighted readiness' })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(loadProfile().currentSkills).toEqual([
        { skillSlug: 'python', proficiency: 'comfortable' },
      ]);
    });

    await user.click(screen.getByRole('button', { name: 'Analyze my readiness' }));
    await screen.findByRole('img', { name: '50% weighted readiness' });
    expect(apiMocks.analyze).toHaveBeenLastCalledWith(
      {
        targetRoleSlug: backendRole.slug,
        currentSkills: [{ skillSlug: 'python', proficiency: 'comfortable' }],
      },
      expect.any(AbortSignal),
    );
  });
});
