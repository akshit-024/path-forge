import type { AnalysisRequest, AnalysisResponse } from '../types/api.js';
import type {
  CoveredSkillDto,
  CurrentSkillDto,
  LearningPathDto,
  RecommendedProjectDto,
  SimilarRoleDto,
  SkillDto,
} from '../types/domain.js';
import type { AnalysisService } from '../types/services.js';
import { toProjectDto, toRoleDto, toSkillDto } from '../utils/dto.js';
import { asArray, asNumber, asRecord, asString } from '../utils/objects.js';
import { calculateReadiness, PROFICIENCY_FACTORS } from './readiness.js';
import type { GraphRepository } from './repository.js';
import { TargetRequirementsResolver, toRequirementQueryParameters } from './target-requirements.js';

export class DefaultAnalysisService implements AnalysisService {
  public constructor(
    private readonly repository: GraphRepository,
    private readonly targetResolver = new TargetRequirementsResolver(repository),
  ) {}

  public async analyze(input: AnalysisRequest): Promise<AnalysisResponse> {
    const target = await this.targetResolver.resolve(input.targetRoleSlug, input.targetTrackSlug);
    const currentSkillSlugs = input.currentSkills.map((skill) => skill.skillSlug);
    const readiness = calculateReadiness(target.requirements, input.currentSkills);
    const assessedRequirements = readiness.assessedRequirements;
    const demonstratedSkills = assessedRequirements.filter(
      (requirement) => requirement.proficiency === 'project',
    );
    const comfortableSkills = assessedRequirements.filter(
      (requirement) => requirement.proficiency === 'comfortable',
    );
    const developingSkills = assessedRequirements.filter(
      (requirement) => requirement.proficiency === 'learning',
    );
    const missingSkills = assessedRequirements.filter(
      (requirement) => requirement.proficiency === null,
    );
    const requirementDefinitions = toRequirementQueryParameters(target.requirements);

    const [pathRows, projectRows, similarRoleRows] = await Promise.all([
      this.repository.getLearningPaths(requirementDefinitions, currentSkillSlugs),
      this.repository.getRecommendedProjects(requirementDefinitions, currentSkillSlugs),
      this.repository.getSimilarRoles(input.targetRoleSlug, requirementDefinitions),
    ]);

    return {
      targetRole: target.role,
      targetTrack: target.track,
      readinessPercentage: readiness.readinessPercentage,
      assessedRequirements,
      demonstratedSkills,
      comfortableSkills,
      developingSkills,
      matchedSkills: demonstratedSkills,
      missingSkills,
      coreMissingSkills: missingSkills.filter((skill) => skill.importance === 'core'),
      supportingMissingSkills: missingSkills.filter((skill) => skill.importance === 'supporting'),
      learningPaths: transformLearningPaths(pathRows, input.currentSkills),
      recommendedProjects: transformRecommendedProjects(projectRows),
      similarRoles: transformSimilarRoles(similarRoleRows),
      explanation: {
        matchedWeight: readiness.matchedWeight,
        earnedWeight: readiness.earnedWeight,
        totalWeight: readiness.totalWeight,
        formula:
          'sum of requirement weight × proficiency factor / total requirement weight × 100 (rounded to 1 decimal)',
        selectedSkillCount: input.currentSkills.length,
        proficiencyFactors: { ...PROFICIENCY_FACTORS },
        calculations: assessedRequirements.map((requirement) => ({
          skillSlug: requirement.slug,
          skillName: requirement.name,
          weight: requirement.weight,
          proficiency: requirement.proficiency,
          factor: requirement.factor,
          contribution: requirement.contribution,
        })),
      },
    };
  }
}

export function transformLearningPaths(
  rows: Record<string, unknown>[],
  currentSkills: CurrentSkillDto[],
): LearningPathDto[] {
  const current = new Map(currentSkills.map((skill) => [skill.skillSlug, skill.proficiency]));
  const bestByTarget = new Map<string, { targetSkill: SkillDto; path: SkillDto[] }>();

  for (const row of rows) {
    const targetSkill = toSkillDto(row.targetSkill);
    const path = asArray(row.pathSkills).map(toSkillDto);
    const existing = bestByTarget.get(targetSkill.slug);
    const candidateIsBetter =
      !existing ||
      (path.length > 0 && existing.path.length === 0) ||
      (path.length > 0 && path.length < existing.path.length);
    if (candidateIsBetter) bestByTarget.set(targetSkill.slug, { targetSkill, path });
  }

  return [...bestByTarget.values()]
    .map(({ targetSkill, path }): LearningPathDto => {
      const sequence = path.length > 0 ? path : [targetSkill];
      let encounteredNext = false;
      const steps = sequence.map((skill) => {
        let status: 'known' | 'developing' | 'next' | 'later' | 'target';
        const proficiency = current.get(skill.slug);
        if (proficiency !== undefined) {
          status = proficiency === 'learning' ? 'developing' : 'known';
        } else if (path.length === 0) {
          status = current.size === 0 && skill.difficulty === 'foundation' ? 'next' : 'target';
        } else if (!encounteredNext) {
          status = 'next';
          encounteredNext = true;
        } else {
          status = 'later';
        }
        return { skill, status };
      });
      const isDirectTarget = path.length === 0;
      return {
        targetSkill,
        steps,
        isDirectTarget,
        explanation: isDirectTarget
          ? current.size === 0 && targetSkill.difficulty === 'foundation'
            ? `${targetSkill.name} is a foundation-level missing skill, so it is a sensible starting point.`
            : `${targetSkill.name} has no prerequisite path from the selected skills, so it is shown as a direct learning target.`
          : `This is the shortest discovered prerequisite route from a selected skill to ${targetSkill.name}.`,
      };
    })
    .sort((left, right) => {
      const order = { foundation: 0, intermediate: 1, advanced: 2 };
      return (
        order[left.targetSkill.difficulty] - order[right.targetSkill.difficulty] ||
        left.targetSkill.name.localeCompare(right.targetSkill.name)
      );
    });
}

export function transformRecommendedProjects(
  rows: Record<string, unknown>[],
): RecommendedProjectDto[] {
  return rows.map((row) => {
    const coveredSkills = asArray(row.coveredSkills).map((value): CoveredSkillDto => {
      const covered = asRecord(value, 'covered skill');
      return {
        slug: asString(covered.slug, 'covered skill slug'),
        name: asString(covered.name, 'covered skill name'),
        weight: asNumber(covered.weight, 'covered skill weight'),
      };
    });
    const project = toProjectDto(row.project);
    return {
      project,
      coveredSkills,
      coverageCount: asNumber(row.coverageCount, 'coverageCount'),
      coverageWeight: asNumber(row.coverageWeight, 'coverageWeight'),
      practicalScore: asNumber(row.practicalScore, 'practicalScore'),
      reason: `${project.name} practices ${coveredSkills.length} missing ${coveredSkills.length === 1 ? 'skill' : 'skills'}: ${coveredSkills.map((skill) => skill.name).join(', ')}.`,
    };
  });
}

function transformSimilarRoles(rows: Record<string, unknown>[]): SimilarRoleDto[] {
  return rows.map((row) => {
    const sharedSkills = asArray(row.sharedSkills).map((value) => {
      const shared = asRecord(value, 'shared skill');
      return {
        slug: asString(shared.slug, 'shared skill slug'),
        name: asString(shared.name, 'shared skill name'),
        weight: asNumber(shared.weight, 'shared skill weight'),
      };
    });
    const role = toRoleDto(row.role);
    const sharedSkillCount = asNumber(row.sharedSkillCount, 'sharedSkillCount');
    return {
      role,
      sharedSkills,
      sharedSkillCount,
      sharedWeight: asNumber(row.sharedWeight, 'sharedWeight'),
      explanation: `${role.name} shares ${sharedSkillCount} required ${sharedSkillCount === 1 ? 'skill' : 'skills'} with the target role.`,
    };
  });
}
