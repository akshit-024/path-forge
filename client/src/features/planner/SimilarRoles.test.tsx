import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { SimilarRole } from '../../types/domain';
import { SimilarRoles } from './SimilarRoles';

const backendToAi: SimilarRole = {
  role: {
    slug: 'ai-engineer',
    name: 'AI Engineer',
    summary: 'Build and operate applied machine-learning products.',
    description: 'Design practical AI systems with measurable outcomes.',
    category: 'AI and Machine Learning',
    experienceLevel: 'Early career',
  },
  sharedSkillCount: 3,
  sharedSkills: [
    { slug: 'python', name: 'Python', weight: 5 },
    { slug: 'sql', name: 'SQL', weight: 4 },
    { slug: 'git', name: 'Git', weight: 3 },
  ],
  sharedWeight: 12,
  explanation: 'AI Engineer shares 3 required skills with the target role.',
};

const backendToData: SimilarRole = {
  role: {
    slug: 'data-engineer',
    name: 'Data Engineer',
    summary: 'Build reliable data pipelines.',
    description: 'Model and maintain durable data platforms.',
    category: 'Data Engineering',
    experienceLevel: 'Early career',
  },
  sharedSkillCount: 2,
  sharedSkills: [
    { slug: 'python', name: 'Python', weight: 5 },
    { slug: 'sql', name: 'SQL', weight: 4 },
  ],
  sharedWeight: 9,
  explanation: 'Data Engineer shares 2 required skills with the target role.',
};

const backendToMl: SimilarRole = {
  role: {
    slug: 'ml-engineer',
    name: 'ML Engineer',
    summary: 'Productionize machine-learning systems.',
    description: 'Ship and scale model-backed services.',
    category: 'AI and Machine Learning',
    experienceLevel: 'Early career',
  },
  sharedSkillCount: 6,
  sharedSkills: [
    { slug: 'python', name: 'Python', weight: 5 },
    { slug: 'sql', name: 'SQL', weight: 4 },
    { slug: 'git', name: 'Git', weight: 3 },
    { slug: 'docker', name: 'Docker', weight: 3 },
    { slug: 'linux', name: 'Linux', weight: 2 },
    { slug: 'mlops', name: 'MLOps', weight: 2 },
  ],
  sharedWeight: 19,
  explanation: 'ML Engineer shares 6 required skills with the target role.',
};

describe('SimilarRoles', () => {
  it('renders two-role comparison cards with shared-skill evidence', () => {
    render(
      <SimilarRoles roles={[backendToAi, backendToData]} onUseAsTarget={vi.fn()} />,
    );

    expect(screen.getByRole('heading', { name: 'Roles connected through shared skills' })).toBeInTheDocument();
    expect(screen.getByText('AI Engineer')).toBeInTheDocument();
    expect(screen.getByText('Data Engineer')).toBeInTheDocument();
    expect(screen.getByText('3 shared')).toBeInTheDocument();
    expect(screen.getByText('2 shared')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Skills shared with AI Engineer' })).toHaveTextContent(
      'Python',
    );
    expect(screen.getByRole('list', { name: 'Skills shared with Data Engineer' })).toHaveTextContent(
      'SQL',
    );
  });

  it('renders three-role comparison cards and keeps the responsive grid structure', () => {
    const { container } = render(
      <SimilarRoles roles={[backendToAi, backendToData, backendToMl]} onUseAsTarget={vi.fn()} />,
    );

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
    const grid = container.querySelector('div.grid');
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('shows at most five shared-skill chips and routes Use as target to the selected role', async () => {
    const onUseAsTarget = vi.fn();
    const user = userEvent.setup();
    render(<SimilarRoles roles={[backendToMl]} onUseAsTarget={onUseAsTarget} />);

    const chipList = screen.getByRole('list', { name: 'Skills shared with ML Engineer' });
    expect(chipList.querySelectorAll('li')).toHaveLength(5);
    expect(chipList).toHaveTextContent('Docker');
    expect(chipList).toHaveTextContent('Linux');
    expect(chipList).not.toHaveTextContent('MLOps');

    await user.click(screen.getByRole('button', { name: 'Use ML Engineer as target role' }));
    expect(onUseAsTarget).toHaveBeenCalledWith('ml-engineer');
  });
});