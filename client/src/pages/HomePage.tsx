import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleDashed,
  GitBranch,
  Lightbulb,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const flow = [
  {
    label: 'Current skills',
    detail: 'What you already know',
    icon: CheckCircle2,
    tone: 'border-teal-200 bg-teal-50 text-teal-800',
  },
  {
    label: 'Missing skills',
    detail: 'What closes the gap',
    icon: CircleDashed,
    tone: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  },
  {
    label: 'Target role',
    detail: 'Where you want to go',
    icon: Target,
    tone: 'border-sky-200 bg-sky-50 text-sky-800',
  },
];

const evidence = [
  {
    icon: GitBranch,
    title: 'A roadmap with reasons',
    description:
      'Follow prerequisite chains in a useful order, with every step tied back to your target role.',
  },
  {
    icon: BookOpenCheck,
    title: 'Projects that close gaps',
    description: 'Prioritize portfolio work that builds several high-value missing skills at once.',
  },
  {
    icon: Lightbulb,
    title: 'Alternatives worth seeing',
    description:
      'Discover nearby roles through skills you already share, not generic job-title similarity.',
  },
];

export function HomePage() {
  return (
    <>
      <section className="page-shell grid items-center gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
        <div>
          <span className="eyebrow">
            <GitBranch size={14} aria-hidden="true" />
            Explainable tech career navigator
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[3.65rem]">
            Turn your current skills into a clear route to your next tech role.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            PathForge maps what you know to real role requirements, then explains which skills,
            learning paths and portfolio projects will move you forward.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/planner" className="button-primary px-5">
              Build my career route
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/about" className="button-secondary px-5">
              How the model works
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-teal-600" aria-hidden="true" /> Weighted
              requirements
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-teal-600" aria-hidden="true" /> Prerequisite
              paths
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-teal-600" aria-hidden="true" /> Visible
              evidence
            </span>
          </div>
        </div>

        <div
          className="surface-card relative overflow-hidden p-5 sm:p-7"
          aria-label="How PathForge creates a route"
        >
          <div
            className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-teal-50"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-slate-400">
                  Your route
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  From profile to practical next step
                </h2>
              </div>
              <span className="grid size-10 place-items-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700">
                <GitBranch size={20} aria-hidden="true" />
              </span>
            </div>

            <ol className="mt-7 grid gap-3">
              {flow.map(({ label, detail, icon: Icon, tone }, index) => (
                <li key={label} className="relative flex items-center gap-4">
                  {index < flow.length - 1 ? (
                    <span
                      className="absolute left-5 top-10 h-5 w-px bg-slate-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl border ${tone}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                    <p className="text-sm font-extrabold text-slate-800">{label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">0{index + 1}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-700">
                The difference
              </p>
              <p className="mt-1.5 text-sm leading-6 text-indigo-950/75">
                Every recommendation can be traced through the connected skills that produced it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/75">
        <div className="page-shell py-12">
          <div className="max-w-2xl">
            <span className="eyebrow">Graph-backed guidance</span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Recommendations you can inspect, not just accept
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              PathForge treats roles, skills and projects as a connected neighborhood. Those
              relationships become the evidence behind your readiness score and plan.
            </p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {evidence.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-slate-900 text-white">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-extrabold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
