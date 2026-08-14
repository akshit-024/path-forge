import { BriefcaseBusiness, Search, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import type { Role } from '../../types/domain';

interface RoleSelectorProps {
  roles: Role[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export function RoleSelector({ roles, selectedSlug, onSelect }: RoleSelectorProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) =>
        [role.name, role.category, role.summary, role.description]
          .join(' ')
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      ),
    [normalizedQuery, roles],
  );

  return (
    <div>
      <label htmlFor="role-search" className="sr-only">
        Search target roles
      </label>
      <div className="relative max-w-xl">
        <Search
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          id="role-search"
          type="search"
          className="field-input pl-10"
          placeholder="Search by role or category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filteredRoles.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            compact
            icon={BriefcaseBusiness}
            title="No roles match that search"
            description="Try a broader role title or clear the search to see every target in the career graph."
            action={
              <button type="button" className="button-secondary" onClick={() => setQuery('')}>
                Clear search
              </button>
            }
          />
        </div>
      ) : (
        <fieldset className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <legend className="sr-only">Choose a target technology role</legend>
          {filteredRoles.map((role) => {
            const selected = role.slug === selectedSlug;
            return (
              <label
                key={role.slug}
                className={`group relative cursor-pointer rounded-2xl border p-5 transition-all ${
                  selected
                    ? 'border-teal-600 bg-teal-50/70 shadow-[0_0_0_2px_rgb(13_148_136/12%)]'
                    : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <input
                  type="radio"
                  name="target-role"
                  value={role.slug}
                  checked={selected}
                  onChange={() => onSelect(role.slug)}
                  className="sr-only"
                />
                <span
                  className={`grid size-9 place-items-center rounded-xl ${
                    selected
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  <Target size={17} aria-hidden="true" />
                </span>
                <span className="mt-4 block text-xs font-extrabold uppercase tracking-wide text-slate-400">
                  {role.category}
                </span>
                <span className="mt-1 block text-base font-extrabold text-slate-900">
                  {role.name}
                </span>
                <span className="mt-2 line-clamp-3 block text-sm leading-5 text-slate-600">
                  {role.summary || role.description}
                </span>
                <span className="mt-4 inline-flex rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[0.68rem] font-bold text-slate-500">
                  {role.experienceLevel}
                </span>
                <span
                  className={`absolute right-4 top-4 size-3 rounded-full border-2 ${
                    selected
                      ? 'border-teal-700 bg-teal-700 ring-4 ring-teal-100'
                      : 'border-slate-300 bg-white'
                  }`}
                  aria-hidden="true"
                />
              </label>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
