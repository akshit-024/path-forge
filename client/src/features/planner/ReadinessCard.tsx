import { CheckCircle2, CircleDotDashed, Scale, Target, TrendingUp } from 'lucide-react';
import type { AnalysisResult, Proficiency } from '../../types/domain';

interface ReadinessCardProps {
  analysis: AnalysisResult;
}

function scoreLabel(score: number) {
  if (score >= 80) return 'Strong foundation';
  if (score >= 55) return 'Building momentum';
  if (score >= 30) return 'Clear growth path';
  return 'Starting your route';
}

function proficiencyLabel(proficiency: Proficiency | null): string {
  if (proficiency === 'project') return 'Project experience';
  if (proficiency === 'comfortable') return 'Comfortable';
  if (proficiency === 'learning') return 'Learning';
  return 'Not selected';
}

function factorLabel(factor: number): string {
  return `${Math.round(factor * 100)}%`;
}

function points(value: number): string {
  return value.toFixed(2).replace(/\.00$/, '.0');
}

export function ReadinessCard({ analysis }: ReadinessCardProps) {
  const score = Math.max(0, Math.min(100, Math.round(analysis.readinessPercentage)));
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const totalRequirements = analysis.assessedRequirements.length;

  return (
    <section
      className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl"
      aria-labelledby="readiness-heading"
    >
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="relative mx-auto size-36 lg:mx-0">
          <svg
            className="size-36 -rotate-90"
            viewBox="0 0 120 120"
            role="img"
            aria-label={`${score}% weighted readiness`}
          >
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#20364b" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#2dd4bf"
              strokeLinecap="round"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <span>
              <strong className="block text-3xl font-black tracking-tight">{score}%</strong>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                readiness
              </span>
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal-300">
            {scoreLabel(score)}
          </span>
          <h2 id="readiness-heading" className="mt-2 text-2xl font-black sm:text-3xl">
            Your route to {analysis.targetRole.name}
          </h2>
          {analysis.targetTrack ? (
            <p className="mt-2 inline-flex rounded-full border border-indigo-300/30 bg-indigo-300/10 px-2.5 py-1 text-xs font-extrabold text-indigo-200">
              {analysis.targetTrack.name} specialization
            </p>
          ) : null}
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Across {totalRequirements} mapped requirements, your demonstrated, comfortable and
            developing skills contribute according to both requirement weight and proficiency.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <CheckCircle2 size={14} className="text-teal-300" aria-hidden="true" /> Demonstrated
            </span>
            <strong className="mt-1 block text-xl font-black">
              {analysis.demonstratedSkills.length}
            </strong>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <TrendingUp size={14} className="text-sky-300" aria-hidden="true" /> Developing
            </span>
            <strong className="mt-1 block text-xl font-black">
              {analysis.developingSkills.length}
            </strong>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <CircleDotDashed size={14} className="text-indigo-300" aria-hidden="true" /> Missing
            </span>
            <strong className="mt-1 block text-xl font-black">
              {analysis.missingSkills.length}
            </strong>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-white/[0.035] px-6 py-3 text-xs leading-5 text-slate-400 sm:px-8">
        <div className="flex items-start gap-2">
          <Scale size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            Weighted calculation: {points(analysis.explanation.earnedWeight)} earned points ÷{' '}
            {points(analysis.explanation.totalWeight)} total points × 100.
          </span>
        </div>
        <details className="group mt-3 rounded-xl border border-white/10 bg-white/5">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 font-extrabold text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">
            Show per-skill score calculation
            <Target size={14} className="text-indigo-300" aria-hidden="true" />
          </summary>
          <div className="border-t border-white/10 p-3">
            <p className="mb-3 text-slate-400">
              Each contribution is the requirement weight multiplied by your proficiency factor.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {analysis.explanation.calculations.map((calculation) => (
                <li
                  key={calculation.skillSlug}
                  className="rounded-lg border border-white/10 bg-slate-950/60 p-3"
                >
                  <strong className="block text-sm text-white">{calculation.skillName}</strong>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                    <div>
                      <dt className="text-slate-500">Weight</dt>
                      <dd className="font-extrabold text-slate-200">{calculation.weight}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Proficiency</dt>
                      <dd className="font-extrabold text-slate-200">
                        {proficiencyLabel(calculation.proficiency)} (
                        {factorLabel(calculation.factor)})
                      </dd>
                    </div>
                    <div className="col-span-2 mt-1 border-t border-white/10 pt-2">
                      <dt className="text-slate-500">Contribution</dt>
                      <dd className="font-extrabold text-teal-300">
                        {points(calculation.contribution)} points
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </section>
  );
}
