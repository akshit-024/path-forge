import { ArrowUpRight, Target, UsersRound } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import type { SimilarRole } from '../../types/domain';

interface SimilarRolesProps {
  roles: SimilarRole[];
  onUseAsTarget: (roleSlug: string) => void;
}

export function SimilarRoles({ roles, onUseAsTarget }: SimilarRolesProps) {
  return (
    <section aria-labelledby="similar-roles-heading">
      <div className="mb-4">
        <span className="eyebrow">
          <UsersRound size={14} aria-hidden="true" />
          Nearby opportunities
        </span>
        <h2 id="similar-roles-heading" className="mt-2 text-2xl font-black text-slate-950">
          Roles connected through shared skills
        </h2>
      </div>

      {roles.length === 0 ? (
        <EmptyState
          compact
          icon={UsersRound}
          title="No similar roles found"
          description="The selected role currently has no strong shared-skill neighborhood in the career graph."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <article key={role.role.slug} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="tag border-teal-100 bg-teal-50 text-teal-800">
                  {role.sharedSkillCount} shared
                </span>
                <ArrowUpRight size={17} className="text-slate-300" aria-hidden="true" />
              </div>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                {role.role.category}
              </p>
              <h3 className="mt-1 font-black text-slate-900">{role.role.name}</h3>
              <p className="mt-2 text-sm leading-5 text-slate-600">{role.role.summary}</p>
              <ul
                className="mt-4 flex flex-wrap gap-1.5"
                aria-label={`Skills shared with ${role.role.name}`}
              >
                {role.sharedSkills.slice(0, 5).map((skill) => (
                  <li key={skill.slug} className="tag bg-white text-[0.65rem]">
                    {skill.name}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-5 text-slate-500">{role.explanation}</p>
              <button
                type="button"
                className="button-secondary mt-5 w-full justify-center text-xs"
                onClick={() => onUseAsTarget(role.role.slug)}
                aria-label={`Use ${role.role.name} as target role`}
              >
                <Target size={14} aria-hidden="true" /> Use as target
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
