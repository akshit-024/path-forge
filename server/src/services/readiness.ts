import type {
  AssessedRequirementDto,
  CurrentSkillDto,
  Proficiency,
  RequirementDefinitionDto,
} from '../types/domain.js';

export const PROFICIENCY_FACTORS: Readonly<Record<Proficiency, number>> = Object.freeze({
  learning: 0.35,
  comfortable: 0.7,
  project: 1,
});

export interface ReadinessCalculation {
  assessedRequirements: AssessedRequirementDto[];
  matchedWeight: number;
  earnedWeight: number;
  totalWeight: number;
  readinessPercentage: number;
}

export function calculateReadiness(
  requirements: RequirementDefinitionDto[],
  currentSkills: CurrentSkillDto[],
): ReadinessCalculation {
  const proficiencyBySlug = new Map(
    currentSkills.map(({ skillSlug, proficiency }) => [skillSlug, proficiency] as const),
  );
  let earnedWeightForScore = 0;
  let matchedWeight = 0;
  let totalWeight = 0;

  const assessedRequirements = requirements.map((requirement): AssessedRequirementDto => {
    const proficiency = proficiencyBySlug.get(requirement.slug) ?? null;
    const factor = proficiency === null ? 0 : PROFICIENCY_FACTORS[proficiency];
    const rawContribution = requirement.weight * factor;
    totalWeight += requirement.weight;
    earnedWeightForScore += rawContribution;
    if (proficiency === 'project') matchedWeight += requirement.weight;

    return {
      ...requirement,
      selected: proficiency !== null,
      proficiency,
      factor,
      contribution: roundToTwoDecimals(rawContribution),
    };
  });

  const readinessPercentage =
    totalWeight === 0 ? 0 : Math.round((earnedWeightForScore / totalWeight) * 1_000) / 10;

  return {
    assessedRequirements,
    matchedWeight,
    earnedWeight: roundToTwoDecimals(earnedWeightForScore),
    totalWeight,
    readinessPercentage,
  };
}

function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
