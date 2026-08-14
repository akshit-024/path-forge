import { ArrowRight, BriefcaseBusiness, Network, PencilLine, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AnalysisResult } from '../../types/domain';
import { LearningRoadmap } from '../roadmap/LearningRoadmap';
import { NextPriorities } from './NextPriorities';
import { ProjectRecommendations } from './ProjectRecommendations';
import { ReadinessCard } from './ReadinessCard';
import { SimilarRoles } from './SimilarRoles';
import { SkillGapSections } from './SkillGapSections';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  onEditSkills: () => void;
  onChangeTargetRole: () => void;
  onStartNewPlan: () => void;
  onUseSimilarRole: (roleSlug: string) => void;
}

export function AnalysisResults({
  analysis,
  onEditSkills,
  onChangeTargetRole,
  onStartNewPlan,
  onUseSimilarRole,
}: AnalysisResultsProps) {
  return (
    <div className="space-y-10">
      <section
        className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        aria-label="Plan actions"
      >
        <div>
          <p className="text-sm font-extrabold text-slate-900">Compare another career route</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Change the target while keeping your current skills, or start with a clean profile.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="button-secondary" onClick={onChangeTargetRole}>
              <BriefcaseBusiness size={15} aria-hidden="true" /> Change target role
            </button>
            <button type="button" className="button-secondary" onClick={onEditSkills}>
              <PencilLine size={15} aria-hidden="true" /> Adjust skills
            </button>
          </div>
          <button
            type="button"
            className="button-quiet self-start text-xs sm:self-auto"
            onClick={onStartNewPlan}
          >
            <RotateCcw size={13} aria-hidden="true" /> Start new plan
          </button>
        </div>
      </section>

      <ReadinessCard analysis={analysis} />
      <NextPriorities analysis={analysis} />
      <SkillGapSections
        demonstrated={analysis.demonstratedSkills}
        comfortable={analysis.comfortableSkills}
        developing={analysis.developingSkills}
        missing={analysis.missingSkills}
        coreMissing={analysis.coreMissingSkills}
        supportingMissing={analysis.supportingMissingSkills}
        paths={analysis.learningPaths}
        projects={analysis.recommendedProjects}
      />
      <LearningRoadmap
        paths={analysis.learningPaths}
        developingSkillSlugs={analysis.developingSkills.map((skill) => skill.slug)}
      />
      <ProjectRecommendations projects={analysis.recommendedProjects} />
      <SimilarRoles roles={analysis.similarRoles} onUseAsTarget={onUseSimilarRole} />

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
        <div>
          <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-indigo-700">
            <Network size={15} aria-hidden="true" /> Inspect the evidence
          </span>
          <h2 className="mt-2 text-xl font-black text-indigo-950">
            See how every recommendation connects
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-900/70">
            Explore the role, its required skills, prerequisite chains and relevant portfolio
            projects as an interactive graph.
          </p>
        </div>
        <div className="mt-5 flex shrink-0 flex-col gap-2 sm:mt-0">
          <Link to="/graph" className="button-primary">
            Explore the graph <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
