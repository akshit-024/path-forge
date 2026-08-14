import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { CurrentSkill, RoleRequirement, Skill } from '../../types/domain';
import { SkillSelector } from './SkillSelector';

const javascript: Skill = {
  slug: 'javascript',
  name: 'JavaScript',
  category: 'Programming Languages',
  description: 'Program interactive web applications.',
  difficulty: 'foundation',
};

const git: Skill = {
  slug: 'git',
  name: 'Git',
  category: 'Developer Tools',
  description: 'Track source changes and collaborate safely.',
  difficulty: 'foundation',
};

const machineLearning: Skill = {
  slug: 'machine-learning',
  name: 'Machine Learning',
  category: 'AI and Machine Learning',
  description: 'Train and evaluate predictive models.',
  difficulty: 'advanced',
};

const powerBi: Skill = {
  slug: 'power-bi',
  name: 'Power BI',
  category: 'Data Analytics',
  description: 'Build interactive business dashboards.',
  difficulty: 'intermediate',
};

const skills = [javascript, git, machineLearning, powerBi];
const requirements: RoleRequirement[] = [
  {
    ...javascript,
    importance: 'core',
    weight: 5,
    targetLevel: 'intermediate',
  },
  {
    ...git,
    importance: 'supporting',
    weight: 3,
    targetLevel: 'foundation',
  },
];

function Harness({ initialSelected = [] }: { initialSelected?: string[] }) {
  const [currentSkills, setCurrentSkills] = useState<CurrentSkill[]>(
    initialSelected.map((skillSlug) => ({ skillSlug, proficiency: 'project' })),
  );
  return (
    <SkillSelector
      skills={skills}
      requirements={requirements}
      roleName="Frontend Developer"
      currentSkills={currentSkills}
      onChange={setCurrentSkills}
    />
  );
}

describe('SkillSelector', () => {
  it('shows graph requirements first across categories and keeps unrelated skills collapsed', () => {
    render(<Harness />);

    const requiredSection = screen
      .getByRole('heading', { name: 'Required for this role' })
      .closest('section');
    expect(requiredSection).not.toBeNull();
    expect(
      within(requiredSection as HTMLElement).getByRole('checkbox', { name: 'JavaScript' }),
    ).toBeInTheDocument();
    expect(
      within(requiredSection as HTMLElement).getByRole('checkbox', { name: 'Git' }),
    ).toBeInTheDocument();
    expect(
      within(requiredSection as HTMLElement).queryByText('Machine Learning'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Core requirements')).toBeInTheDocument();
    expect(screen.getByText('Supporting requirements')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Other skills in your profile/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('checkbox', { name: /Machine Learning/ })).not.toBeInTheDocument();
  });

  it('selects, announces and clears all current skills', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const javascriptControl = screen.getByRole('checkbox', { name: 'JavaScript' });
    await user.click(javascriptControl);

    expect(javascriptControl).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('button', {
        name: 'Learning proficiency for JavaScript, 35% contribution factor',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(screen.getByText('1 of 2 role requirements selected')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(javascriptControl).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('0 selected')).toBeInTheDocument();
  });

  it('changes proficiency with the keyboard and provides an explicit remove action', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const javascriptControl = screen.getByRole('checkbox', { name: 'JavaScript' });
    javascriptControl.focus();
    await user.keyboard(' ');

    const comfortable = screen.getByRole('button', {
      name: 'Comfortable proficiency for JavaScript, 70% contribution factor',
    });
    comfortable.focus();
    await user.keyboard('{Enter}');
    expect(comfortable).toHaveAttribute('aria-pressed', 'true');
    expect(javascriptControl).toHaveTextContent('Comfortable');

    const project = screen.getByRole('button', {
      name: 'Project experience proficiency for JavaScript, 100% contribution factor',
    });
    project.focus();
    await user.keyboard(' ');
    expect(project).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Remove JavaScript from current skills' }));
    expect(javascriptControl).toHaveAttribute('aria-checked', 'false');
    expect(screen.queryByRole('group', { name: 'Set proficiency for JavaScript' })).toBeNull();
  });

  it('clears only role selections while preserving unrelated profile skills', async () => {
    const user = userEvent.setup();
    render(<Harness initialSelected={['javascript', 'machine-learning']} />);

    expect(
      screen.getByText(/Not used in the current role score: Machine Learning/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear role selections' }));

    expect(screen.getByRole('checkbox', { name: 'JavaScript' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByText('1 selected')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Other skills in your profile/ }));
    expect(
      screen.getByRole('checkbox', {
        name: 'Machine Learning, not used in the current role score',
      }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('expands optional skills with the keyboard and labels them outside the score', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const disclosure = screen.getByRole('button', { name: /Other skills in your profile/ });

    disclosure.focus();
    expect(disclosure).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Not used in the current role score')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Machine Learning, not used in the current role score',
      }),
    ).toBeInTheDocument();
  });

  it('searches required and unrelated skills, then restores the collapsed role-aware view', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const search = screen.getByRole('searchbox', { name: 'Search skills' });

    await user.type(search, 'java');

    const requiredSection = screen
      .getByRole('heading', { name: 'Required for this role' })
      .closest('section');
    expect(
      within(requiredSection as HTMLElement).getByRole('checkbox', { name: 'JavaScript' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /Machine Learning/ })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'machine');

    expect(
      screen.getByRole('checkbox', {
        name: 'Machine Learning, not used in the current role score',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No Frontend Developer requirements match this search.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Other skills in your profile/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await user.clear(search);

    expect(screen.getByRole('checkbox', { name: 'JavaScript' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /Machine Learning/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Other skills in your profile/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('provides a recoverable no-results state', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole('searchbox', { name: 'Search skills' }), 'kubernetes');

    expect(screen.getByText('No skills match that search')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByRole('checkbox', { name: 'JavaScript' })).toBeInTheDocument();
  });

  it('filters only role requirements with accessible count controls', async () => {
    const user = userEvent.setup();
    render(<Harness initialSelected={['javascript']} />);

    const filters = screen.getByRole('group', { name: 'Filter role requirements' });
    await user.click(within(filters).getByRole('button', { name: 'Supporting (1)' }));
    expect(within(filters).getByRole('button', { name: 'Supporting (1)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByRole('checkbox', { name: 'JavaScript' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Git' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Other skills in your profile/ }));
    expect(
      screen.getByRole('checkbox', {
        name: 'Machine Learning, not used in the current role score',
      }),
    ).toBeInTheDocument();

    await user.click(within(filters).getByRole('button', { name: 'Selected (1)' }));
    expect(screen.getByRole('checkbox', { name: 'JavaScript' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Git' })).not.toBeInTheDocument();
  });

  it('confirms clearing multiple role selections and preserves unrelated skills', async () => {
    const user = userEvent.setup();
    render(<Harness initialSelected={['javascript', 'git', 'machine-learning']} />);

    await user.click(screen.getByRole('button', { name: 'Clear role selections' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'Clear 2 selected role requirements?',
    );
    await user.click(screen.getByRole('button', { name: 'Confirm clear' }));

    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(
      screen.getByText(/Not used in the current role score: Machine Learning/),
    ).toBeInTheDocument();
  });

  it('expands a requirement explanation with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Harness initialSelected={['javascript']} />);
    const why = screen.getByRole('button', { name: 'Why JavaScript matters' });

    why.focus();
    await user.keyboard('{Enter}');

    expect(why).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Program interactive web applications.')).toBeInTheDocument();
    expect(screen.getByText(/5\/5.*Highest relative weight/)).toBeInTheDocument();
    expect(screen.getByText('Project experience (100% factor)')).toBeInTheDocument();
  });
});
