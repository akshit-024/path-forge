import { BriefcaseBusiness, PencilLine } from 'lucide-react';
import type { Role, RoleRequirement, Track } from '../../types/domain';

interface RoleContextCardProps {
  role: Role;
  track?: Track | null;
  requirements: RoleRequirement[];
  selectedSlugs: string[];
  onChangeRole: () => void;
}

export function RoleContextCard({
  role,
  track = null,
  requirements,
  selectedSlugs,
  onChangeRole,
}: RoleContextCardProps) {
  const selected = new Set(selectedSlugs);
  const coreCount = requirements.filter((requirement) => requirement.importance === 'core').length;
  const supportingCount = requirements.filter(
    (requirement) => requirement.importance === 'supporting',
  ).length;
  const selectedCount = requirements.filter((requirement) => selected.has(requirement.slug)).length;

  return (
    <section
      className="mb-6 rounded-2xl border border-teal-200 bg-teal-50/60 p-4 sm:p-5"
      aria-labelledby="selected-role-context"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-teal-700">
            <BriefcaseBusiness size={14} aria-hidden="true" /> Target role
          </p>
          <h2 id="selected-role-context" className="mt-2 text-xl font-black text-slate-950">
            {role.name}
          </h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            {role.category}
          </p>
          {track ? (
            <p className="mt-2 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-indigo-700">
              {track.name} specialization
            </p>
          ) : null}
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {track ? track.summary || track.description : role.summary || role.description}
          </p>
        </div>
        <button type="button" className="button-secondary shrink-0" onClick={onChangeRole}>
          <PencilLine size={15} aria-hidden="true" /> Change role
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-teal-200/70 pt-4 text-sm sm:grid-cols-4">
        <div className="rounded-xl bg-white/80 p-3">
          <dt className="text-xs font-bold text-slate-500">Requirements</dt>
          <dd className="mt-1 text-lg font-black text-slate-900">{requirements.length}</dd>
        </div>
        <div className="rounded-xl bg-white/80 p-3">
          <dt className="text-xs font-bold text-slate-500">Core</dt>
          <dd className="mt-1 text-lg font-black text-indigo-800">{coreCount}</dd>
        </div>
        <div className="rounded-xl bg-white/80 p-3">
          <dt className="text-xs font-bold text-slate-500">Supporting</dt>
          <dd className="mt-1 text-lg font-black text-sky-800">{supportingCount}</dd>
        </div>
        <div className="rounded-xl bg-white/80 p-3">
          <dt className="text-xs font-bold text-slate-500">Selected</dt>
          <dd className="mt-1 text-lg font-black text-teal-800">{selectedCount}</dd>
        </div>
      </dl>
    </section>
  );
}
