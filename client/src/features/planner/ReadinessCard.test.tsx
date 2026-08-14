import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnalysisResult, AssessedRequirement, Role } from '../../types/domain';
import { ReadinessCard } from './ReadinessCard';

const role: Role = {
  slug: 'backend-developer',
  name: 'Backend Developer',
  summary: 'Build reliable services.',
  description: 'Design and maintain backend systems.',
  category: 'Software Engineering',
  experienceLevel: 'Early career',
};

function assessed(
  slug: string,
  name: string,
  proficiency: AssessedRequirement['proficiency'],
  factor: number,
  contribution: number,
): AssessedRequirement {
  return {
    slug,
    name,
    description: `${name} capability.`,
    category: 'Engineering',
    difficulty: 'foundation',
    importance: 'core',
    weight: 5,
    targetLevel: 'intermediate',
    proficiency,
    factor,
    contribution,
  };
}

const python = assessed('python', 'Python', 'project', 1, 5);
const restApis = assessed('rest-apis', 'REST APIs', null, 0, 0);

const analysis: AnalysisResult = {
  targetRole: role,
  targetTrack: null,
  readinessPercentage: 63,
  assessedRequirements: [python, restApis],
  demonstratedSkills: [python],
  comfortableSkills: [],
  developingSkills: [],
  matchedSkills: [python],
  missingSkills: [restApis],
  coreMissingSkills: [restApis],
  supportingMissingSkills: [],
  learningPaths: [],
  recommendedProjects: [],
  similarRoles: [],
  explanation: {
    matchedWeight: 5,
    earnedWeight: 5,
    totalWeight: 8,
    formula: 'earned / total * 100',
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
        weight: 3,
        proficiency: null,
        factor: 0,
        contribution: 0,
      },
    ],
  },
};

describe('ReadinessCard', () => {
  it('renders the proficiency-adjusted score and classification counts', () => {
    render(<ReadinessCard analysis={analysis} />);

    expect(screen.getByRole('img', { name: '63% weighted readiness' })).toBeInTheDocument();
    expect(screen.getByText('Your route to Backend Developer')).toBeInTheDocument();
    expect(screen.getByText(/Across 2 mapped requirements/)).toBeInTheDocument();
    expect(screen.getByText(/5\.0 earned points ÷ 8\.0 total points × 100/)).toBeInTheDocument();
    expect(screen.getByText('Demonstrated')).toBeInTheDocument();
    expect(screen.getByText('Developing')).toBeInTheDocument();
    expect(screen.getByText('Missing')).toBeInTheDocument();
  });

  it('renders an expandable per-skill calculation explanation', async () => {
    const user = userEvent.setup();
    render(<ReadinessCard analysis={analysis} />);

    await user.click(screen.getByText('Show per-skill score calculation'));

    expect(screen.getByText('Project experience (100%)')).toBeInTheDocument();
    expect(screen.getByText('5.0 points')).toBeInTheDocument();
    expect(screen.getByText('Not selected (0%)')).toBeInTheDocument();
    expect(screen.getByText('0.0 points')).toBeInTheDocument();
  });
});
