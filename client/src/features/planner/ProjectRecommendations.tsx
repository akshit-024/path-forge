import { Clock3, FolderKanban, Layers3 } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import type { ProjectRecommendation } from '../../types/domain';

interface ProjectRecommendationsProps {
  projects: ProjectRecommendation[];
}

export function ProjectRecommendations({ projects }: ProjectRecommendationsProps) {
  return (
    <section aria-labelledby="projects-heading">
      <div className="mb-4">
        <span className="eyebrow">
          <FolderKanban size={14} aria-hidden="true" />
          Portfolio projects
        </span>
        <h2 id="projects-heading" className="mt-2 text-2xl font-black text-slate-950">
          Build proof while closing skill gaps
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          These projects cover the largest useful combinations of skills missing from your target
          role.
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No matching projects"
          description="No portfolio project in the current graph covers your missing requirements. Continue with the direct roadmap targets instead."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project, index) => (
            <article key={project.project.slug} className="surface-card flex flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 font-black text-indigo-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-wrap justify-end gap-2">
                  <span className="tag">{project.project.difficulty}</span>
                  <span className="tag gap-1">
                    <Clock3 size={12} aria-hidden="true" /> {project.project.estimatedHours}h
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                {project.project.category}
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-900">{project.project.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                {project.project.summary}
              </p>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  <Layers3 size={14} aria-hidden="true" /> Covers {project.coverageCount} missing
                  skill{project.coverageCount === 1 ? '' : 's'}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.coveredSkills.map((skill) => (
                    <li key={skill.slug} className="tag border-indigo-100 bg-white text-indigo-700">
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                <strong className="text-slate-700">Why this project:</strong>{' '}
                {project.reason ||
                  `It develops ${project.coverageCount} relevant gap${project.coverageCount === 1 ? '' : 's'} with a combined requirement weight of ${project.coverageWeight}.`}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
