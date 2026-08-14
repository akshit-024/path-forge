import { render, screen } from '@testing-library/react';
import type { LearningPath, Skill } from '../../types/domain';
import { LearningRoadmap } from './LearningRoadmap';

function skill(slug: string, name: string): Skill {
  return {
    slug,
    name,
    category: 'Engineering',
    description: `Build ${name} capability.`,
    difficulty: 'intermediate',
  };
}

const typescript = skill('typescript', 'TypeScript');
const react = skill('react', 'React');

const path: LearningPath = {
  targetSkill: react,
  isDirectTarget: false,
  explanation: 'Build from typed JavaScript into component development.',
  steps: [
    { skill: typescript, status: 'known' },
    { skill: react, status: 'target' },
  ],
};

describe('LearningRoadmap', () => {
  it('marks learning-proficiency requirements as in progress instead of fully known', () => {
    render(<LearningRoadmap paths={[path]} developingSkillSlugs={['typescript', 'react']} />);

    expect(screen.getByText('In progress · Learning')).toBeInTheDocument();
    expect(screen.getAllByText(/In progress/)).toHaveLength(3);
    expect(screen.queryByText(/1\. Known/)).not.toBeInTheDocument();
  });
});
