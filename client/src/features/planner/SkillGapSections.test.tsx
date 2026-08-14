import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AssessedRequirement } from '../../types/domain';
import { SkillGapSections } from './SkillGapSections';

function assessment(
  slug: string,
  name: string,
  proficiency: AssessedRequirement['proficiency'],
  factor: number,
  contribution: number,
  importance: AssessedRequirement['importance'] = 'core',
): AssessedRequirement {
  return {
    slug,
    name,
    category: 'Engineering',
    description: `Use ${name} effectively.`,
    difficulty: 'intermediate',
    importance,
    weight: 4,
    targetLevel: 'intermediate',
    proficiency,
    factor,
    contribution,
  };
}

const demonstrated = assessment('javascript', 'JavaScript', 'project', 1, 4);
const comfortable = assessment('react', 'React', 'comfortable', 0.7, 2.8);
const developing = assessment('typescript', 'TypeScript', 'learning', 0.35, 1.4);
const missing = assessment('testing', 'Testing', null, 0, 0, 'supporting');

describe('SkillGapSections', () => {
  it('separates proficiency classifications and reports categorized missing skills', () => {
    render(
      <SkillGapSections
        demonstrated={[demonstrated]}
        comfortable={[comfortable]}
        developing={[developing]}
        missing={[missing]}
        coreMissing={[]}
        supportingMissing={[missing]}
      />,
    );

    expect(screen.getByText('Demonstrated skills')).toBeInTheDocument();
    expect(screen.getByText('Comfortable skills')).toBeInTheDocument();
    expect(screen.getByText('Developing skills')).toBeInTheDocument();
    expect(screen.getByText(/Your 1 missing requirement appears below/)).toBeInTheDocument();
    expect(screen.getByText('Core gaps')).toBeInTheDocument();
    expect(screen.getByText('Supporting gaps')).toBeInTheDocument();
  });

  it('shows proficiency factor and contribution in expandable skill evidence', async () => {
    const user = userEvent.setup();
    render(
      <SkillGapSections
        demonstrated={[demonstrated]}
        comfortable={[comfortable]}
        developing={[developing]}
        missing={[missing]}
        coreMissing={[]}
        supportingMissing={[missing]}
      />,
    );

    const developingCard = screen.getByText('Developing skills').closest('article');
    expect(developingCard).not.toBeNull();
    await user.click(
      within(developingCard as HTMLElement).getByRole('button', { name: /TypeScript/ }),
    );

    expect(within(developingCard as HTMLElement).getByText('Learning (35%)')).toBeInTheDocument();
    expect(within(developingCard as HTMLElement).getByText('1.40 points')).toBeInTheDocument();
  });
});
