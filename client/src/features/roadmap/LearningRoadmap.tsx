import { ArrowRight, Check, Flag, Footprints, Route, TrendingUp } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import type { LearningPath, RoadmapStep } from '../../types/domain';

const statusStyles = {
  known: {
    label: 'Known',
    icon: Check,
    className: 'border-teal-200 bg-teal-50 text-teal-800',
  },
  next: {
    label: 'Learn next',
    icon: Footprints,
    className: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  },
  later: {
    label: 'Later',
    icon: Flag,
    className: 'border-slate-200 bg-slate-50 text-slate-600',
  },
  target: {
    label: 'Target',
    icon: Flag,
    className: 'border-violet-200 bg-violet-50 text-violet-800',
  },
  developing: {
    label: 'In progress',
    icon: TrendingUp,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
};

function RoadmapStepCard({
  step,
  index,
  developing,
}: {
  step: RoadmapStep;
  index: number;
  developing: boolean;
}) {
  const status = developing ? statusStyles.developing : statusStyles[step.status];
  const Icon = status.icon;

  return (
    <li className="relative flex min-w-0 flex-1 items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg border ${status.className}`}
      >
        <Icon size={15} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-extrabold text-slate-900">{step.skill.name}</h4>
          <span className="tag py-0.5 text-[0.62rem]">{step.skill.difficulty}</span>
        </div>
        <p className="mt-1 text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-400">
          {index + 1}. {status.label}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">{step.skill.description}</p>
      </div>
    </li>
  );
}

interface LearningRoadmapProps {
  paths: LearningPath[];
  developingSkillSlugs?: string[];
}

export function LearningRoadmap({ paths, developingSkillSlugs = [] }: LearningRoadmapProps) {
  const developing = new Set(developingSkillSlugs);
  return (
    <section aria-labelledby="roadmap-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <span className="eyebrow">
            <Route size={14} aria-hidden="true" />
            Recommended roadmap
          </span>
          <h2 id="roadmap-heading" className="mt-2 text-2xl font-black text-slate-950">
            Learn in an order that builds on itself
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Each sequence follows prerequisite relationships toward a missing role requirement.
          </p>
        </div>
      </div>

      {paths.length === 0 ? (
        <EmptyState
          icon={Route}
          title="No prerequisite path found"
          description="The missing skills are still valid direct learning targets. The graph simply has no prerequisite chain connecting them to your current profile."
        />
      ) : (
        <div className="space-y-4">
          {paths.map((path, pathIndex) => (
            <article
              key={`${path.targetSkill.slug}-${pathIndex}`}
              className="surface-card p-5 sm:p-6"
            >
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                    {path.isDirectTarget
                      ? 'Direct learning target'
                      : `Learning path ${pathIndex + 1}`}
                  </p>
                  <h3 className="mt-1 font-extrabold text-slate-900">
                    Toward {path.targetSkill.name}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {developing.has(path.targetSkill.slug) ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-amber-800">
                      In progress · Learning
                    </span>
                  ) : null}
                  <span className="tag">
                    {path.steps.length} step{path.steps.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {path.explanation ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">{path.explanation}</p>
              ) : null}

              {path.steps.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4 text-sm text-indigo-900">
                  Learn <strong>{path.targetSkill.name}</strong> directly. No earlier prerequisite
                  is mapped for this target.
                </div>
              ) : (
                <ol className="mt-4 grid gap-3 lg:grid-flow-col lg:auto-cols-fr">
                  {path.steps.map((step, index) => (
                    <div key={`${step.skill.slug}-${index}`} className="contents">
                      <RoadmapStepCard
                        step={step}
                        index={index}
                        developing={developing.has(step.skill.slug)}
                      />
                      {index < path.steps.length - 1 ? (
                        <ArrowRight
                          size={17}
                          className="mx-auto rotate-90 self-center text-slate-300 lg:rotate-0"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                  ))}
                </ol>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
