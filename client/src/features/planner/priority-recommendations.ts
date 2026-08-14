import type { AnalysisResult, ProjectRecommendation, RequirementSkill } from '../../types/domain';

export interface NextPriority {
  skill: RequirementSkill;
  reason: string;
  nextAction: string;
  project: ProjectRecommendation | null;
}

const importanceOrder = { core: 0, supporting: 1 } as const;
const difficultyOrder = { foundation: 0, intermediate: 1, advanced: 2 } as const;

export function deriveNextPriorities(analysis: AnalysisResult): NextPriority[] {
  return [...analysis.missingSkills]
    .sort(
      (left, right) =>
        importanceOrder[left.importance] - importanceOrder[right.importance] ||
        right.weight - left.weight ||
        difficultyOrder[left.targetLevel] - difficultyOrder[right.targetLevel] ||
        left.name.localeCompare(right.name),
    )
    .slice(0, 3)
    .map((skill) => {
      const path = analysis.learningPaths.find(
        (candidate) => candidate.targetSkill.slug === skill.slug,
      );
      const nextStep = path?.steps.find((step) => step.status !== 'known');
      const project =
        analysis.recommendedProjects.find((candidate) =>
          candidate.coveredSkills.some((covered) => covered.slug === skill.slug),
        ) ?? null;
      const nextAction =
        nextStep && nextStep.skill.slug !== skill.slug
          ? `Start with ${nextStep.skill.name}, the next mapped prerequisite toward ${skill.name}.`
          : project
            ? `Practice ${skill.name} by building ${project.project.name}.`
            : `Build ${skill.name} toward the ${skill.targetLevel} target level.`;

      return {
        skill,
        reason: `${skill.importance === 'core' ? 'Core' : 'Supporting'} requirement with weight ${skill.weight} of 5.`,
        nextAction,
        project,
      };
    });
}
