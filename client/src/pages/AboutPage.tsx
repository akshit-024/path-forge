import { ArrowRight, Boxes, Calculator, GitMerge, SearchCheck, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const concepts = [
  {
    icon: Boxes,
    title: 'Nodes are the things that matter',
    description:
      'Roles, skills and portfolio projects are stored as distinct items with useful details such as difficulty and category.',
  },
  {
    icon: Share2,
    title: 'Relationships provide context',
    description:
      'A role requires skills, one skill can prepare you for another, and projects build practical capability in several skills.',
  },
  {
    icon: SearchCheck,
    title: 'Paths become explanations',
    description:
      'When PathForge suggests a learning step or nearby role, it can show the exact connected path that supports the suggestion.',
  },
];

export function AboutPage() {
  return (
    <div className="page-shell py-10 sm:py-14">
      <header className="max-w-3xl">
        <span className="eyebrow">
          <GitMerge size={14} aria-hidden="true" />
          About the model
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Career guidance built from connections
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Technology careers are not checklists in isolation. Skills unlock other skills, projects
          combine multiple capabilities, and roles overlap. PathForge models those connections
          directly so its guidance stays inspectable.
        </p>
      </header>

      <section className="mt-9 grid gap-4 md:grid-cols-3" aria-labelledby="model-parts-heading">
        <h2 id="model-parts-heading" className="sr-only">
          Parts of the PathForge model
        </h2>
        {concepts.map(({ icon: Icon, title, description }) => (
          <article key={title} className="surface-card p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Icon size={21} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="surface-card p-6 sm:p-8">
          <span className="eyebrow">
            <Calculator size={14} aria-hidden="true" />
            Readiness score
          </span>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Important skills count more</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Each role requirement has a weight from 1 to 5. PathForge adds the weights for
            requirements you already match, divides that by the total requirement weight, and rounds
            the result to a percentage.
          </p>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center font-mono text-sm font-bold text-slate-700">
            matched requirement weight ÷ total requirement weight × 100
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            This is a directional learning signal, not a hiring guarantee. Experience, communication
            and role context still matter.
          </p>
        </article>

        <article className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <span className="text-xs font-extrabold uppercase tracking-[0.13em] text-teal-300">
            Why a graph database?
          </span>
          <h2 className="mt-3 text-2xl font-black">
            The question is usually “how are these connected?”
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Finding a prerequisite chain, roles reached through shared skills, or a project covering
            several gaps means following relationships across multiple steps. A graph database is
            designed for this kind of traversal.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Example graph path">
            {['Known skill', 'Prerequisite path', 'Required skill'].map((label, index) => (
              <div
                key={label}
                className="relative rounded-xl border border-white/10 bg-white/5 p-3 text-center text-xs font-bold"
              >
                {label}
                {index < 2 ? (
                  <ArrowRight
                    size={15}
                    className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-teal-300 sm:block"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-slate-300">
            The returned path is also the explanation: there is no hidden recommendation score that
            users are asked to trust without evidence.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
        <div>
          <h2 className="text-xl font-black text-teal-950">Ready to see the model applied?</h2>
          <p className="mt-2 text-sm leading-6 text-teal-900/70">
            Choose a target, tell PathForge what you know, and inspect the route.
          </p>
        </div>
        <Link to="/planner" className="button-primary mt-5 shrink-0 sm:mt-0">
          Open the planner
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
