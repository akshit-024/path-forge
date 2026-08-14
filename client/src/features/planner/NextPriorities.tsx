import { CheckCircle2, Footprints, FolderKanban, ListChecks } from 'lucide-react';
import type { AnalysisResult } from '../../types/domain';
import { deriveNextPriorities } from './priority-recommendations';

export function NextPriorities({ analysis }: { analysis: AnalysisResult }) {
  const priorities = deriveNextPriorities(analysis);

  return (
    <section className="surface-card p-5 sm:p-6" aria-labelledby="next-priorities-heading">
      <span className="eyebrow">
        <ListChecks size={14} aria-hidden="true" /> Focus first
      </span>
      <h2 id="next-priorities-heading" className="mt-2 text-2xl font-black text-slate-950">
        Your next three priorities
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Core gaps lead the list, followed by requirement weight and a practical learning order.
      </p>

      {priorities.length === 0 ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-950">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-teal-700" aria-hidden="true" />
          <div>
            <h3 className="font-extrabold">All mapped requirements are covered</h3>
            <p className="mt-1 text-sm leading-6 text-teal-900/80">
              Your saved skills currently cover every requirement returned for this target. Keep
              building evidence through the recommended projects and graph.
            </p>
          </div>
        </div>
      ) : (
        <ol className="mt-5 grid gap-4 lg:grid-cols-3">
          {priorities.map((priority, index) => (
            <li
              key={priority.skill.slug}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-slate-950 text-xs font-black text-white">
                  {index + 1}
                </span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  <span className="tag capitalize">{priority.skill.importance}</span>
                  <span className="tag capitalize">{priority.skill.targetLevel}</span>
                </div>
              </div>
              <h3 className="mt-4 font-black text-slate-900">{priority.skill.name}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{priority.reason}</p>
              <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-700">
                <Footprints size={15} className="mt-1 shrink-0 text-teal-700" aria-hidden="true" />
                <span>{priority.nextAction}</span>
              </p>
              {priority.project ? (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-indigo-50 p-3 text-xs leading-5 text-indigo-900">
                  <FolderKanban size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    Project evidence: <strong>{priority.project.project.name}</strong>
                  </span>
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
