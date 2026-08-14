import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  CircleDotDashed,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import type {
  AssessedRequirement,
  LearningPath,
  ProjectRecommendation,
  Proficiency,
} from '../../types/domain';

type SkillTone = 'demonstrated' | 'comfortable' | 'developing' | 'core' | 'supporting';

interface SkillListProps {
  title: string;
  description: string;
  skills: AssessedRequirement[];
  tone: SkillTone;
  paths: LearningPath[];
  projects: ProjectRecommendation[];
}

const toneStyles: Record<SkillTone, string> = {
  demonstrated: 'border-teal-200 bg-teal-50 text-teal-950',
  comfortable: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  developing: 'border-amber-200 bg-amber-50 text-amber-950',
  core: 'border-indigo-200 bg-indigo-50 text-indigo-950',
  supporting: 'border-sky-200 bg-sky-50 text-sky-950',
};

const toneIcons = {
  demonstrated: CheckCircle2,
  comfortable: BadgeCheck,
  developing: TrendingUp,
  core: ShieldCheck,
  supporting: CircleDotDashed,
};

function proficiencyLabel(proficiency: Proficiency | null): string {
  if (proficiency === 'project') return 'Project experience';
  if (proficiency === 'comfortable') return 'Comfortable';
  if (proficiency === 'learning') return 'Learning';
  return 'Not selected';
}

function points(value: number): string {
  return value.toFixed(2).replace(/\.00$/, '.0');
}

function SkillList({ title, description, skills, tone, paths, projects }: SkillListProps) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const Icon = toneIcons[tone];

  return (
    <article className="surface-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl border ${toneStyles[tone]}`}
        >
          <Icon size={19} aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-extrabold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      {skills.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {skills.map((skill) => {
            const detailsId = `${tone}-skill-details-${skill.slug}`;
            const path = paths.find((candidate) => candidate.targetSkill.slug === skill.slug);
            const relatedProjects = projects.filter((project) =>
              project.coveredSkills.some((covered) => covered.slug === skill.slug),
            );

            return (
              <li
                key={skill.slug}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between gap-3 p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-700"
                  aria-expanded={expandedSlug === skill.slug}
                  aria-controls={detailsId}
                  onClick={() =>
                    setExpandedSlug((current) => (current === skill.slug ? null : skill.slug))
                  }
                >
                  <span>
                    <span className="block font-extrabold text-slate-800">{skill.name}</span>
                    <span className="mt-0.5 block text-[0.65rem] font-bold text-slate-500">
                      {proficiencyLabel(skill.proficiency)} · {Math.round(skill.factor * 100)}%
                      factor
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="tag py-0.5 text-[0.62rem] capitalize">
                      {skill.targetLevel}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-slate-400 transition-transform ${expandedSlug === skill.slug ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>
                {expandedSlug === skill.slug ? (
                  <div id={detailsId} className="border-t border-slate-200 bg-slate-50/70 p-3">
                    <p className="text-xs leading-5 text-slate-600">{skill.description}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="font-bold text-slate-400">Requirement</dt>
                        <dd className="mt-0.5 font-extrabold capitalize text-slate-700">
                          {skill.importance}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-400">Weight</dt>
                        <dd className="mt-0.5 font-extrabold text-slate-700">{skill.weight}/5</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-400">Proficiency</dt>
                        <dd className="mt-0.5 font-extrabold text-slate-700">
                          {proficiencyLabel(skill.proficiency)} ({Math.round(skill.factor * 100)}%)
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-400">Contribution</dt>
                        <dd className="mt-0.5 font-extrabold text-slate-700">
                          {points(skill.contribution)} points
                        </dd>
                      </div>
                    </dl>
                    {path ? (
                      <p className="mt-3 text-xs leading-5 text-slate-600">
                        <strong className="text-slate-700">Prerequisite path:</strong>{' '}
                        {path.steps.map((step) => step.skill.name).join(' → ')}
                      </p>
                    ) : null}
                    {relatedProjects.length > 0 ? (
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        <strong className="text-slate-700">Projects:</strong>{' '}
                        {relatedProjects.map((project) => project.project.name).join(', ')}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-5">
          <EmptyState
            compact
            icon={CheckCircle2}
            title={`No ${title.toLocaleLowerCase()}`}
            description={
              tone === 'core' || tone === 'supporting'
                ? 'You currently cover every requirement in this group.'
                : 'No requirements currently fall into this proficiency group.'
            }
          />
        </div>
      )}
    </article>
  );
}

interface SkillGapSectionsProps {
  demonstrated: AssessedRequirement[];
  comfortable: AssessedRequirement[];
  developing: AssessedRequirement[];
  missing: AssessedRequirement[];
  coreMissing: AssessedRequirement[];
  supportingMissing: AssessedRequirement[];
  paths?: LearningPath[];
  projects?: ProjectRecommendation[];
}

export function SkillGapSections({
  demonstrated,
  comfortable,
  developing,
  missing,
  coreMissing,
  supportingMissing,
  paths = [],
  projects = [],
}: SkillGapSectionsProps) {
  return (
    <section aria-labelledby="skills-heading">
      <div className="mb-4">
        <span className="eyebrow">Skill evidence</span>
        <h2 id="skills-heading" className="mt-2 text-2xl font-black text-slate-950">
          What you bring and what to build
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Skills are separated by demonstrated, comfortable and developing proficiency. Your{' '}
          {missing.length} missing requirement{missing.length === 1 ? '' : 's'}{' '}
          {missing.length === 1 ? 'appears' : 'appear'} below as core or supporting gaps.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SkillList
          title="Demonstrated skills"
          description="Requirements backed by project experience at the full factor."
          skills={demonstrated}
          tone="demonstrated"
          paths={paths}
          projects={projects}
        />
        <SkillList
          title="Comfortable skills"
          description="Capabilities you can use confidently, contributing at the 70% factor."
          skills={comfortable}
          tone="comfortable"
          paths={paths}
          projects={projects}
        />
        <SkillList
          title="Developing skills"
          description="Skills in progress that contribute partially at the 35% factor."
          skills={developing}
          tone="developing"
          paths={paths}
          projects={projects}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SkillList
          title="Core gaps"
          description="Missing high-priority requirements to address first."
          skills={coreMissing}
          tone="core"
          paths={paths}
          projects={projects}
        />
        <SkillList
          title="Supporting gaps"
          description="Missing skills that strengthen day-to-day effectiveness."
          skills={supportingMissing}
          tone="supporting"
          paths={paths}
          projects={projects}
        />
      </div>
    </section>
  );
}
