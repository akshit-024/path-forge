export type Difficulty = 'foundation' | 'intermediate' | 'advanced';
export type Importance = 'core' | 'supporting';
export type Proficiency = 'learning' | 'comfortable' | 'project';
export type ProjectDepth = 'introductory' | 'practical' | 'advanced';

export interface CurrentSkillDto {
  skillSlug: string;
  proficiency: Proficiency;
}

export interface RoleDto {
  slug: string;
  name: string;
  summary: string;
  category: string;
  experienceLevel: string;
  description: string;
}

export interface TrackDto {
  slug: string;
  name: string;
  summary: string;
  description: string;
  category: string;
  parentRoleSlug: string;
}

export interface SkillDto {
  slug: string;
  name: string;
  category: string;
  description: string;
  difficulty: Difficulty;
}

export interface ProjectDto {
  slug: string;
  name: string;
  summary: string;
  difficulty: Difficulty;
  estimatedHours: number;
  category: string;
}

export interface RequirementDto extends SkillDto {
  importance: Importance;
  weight: number;
  targetLevel: Difficulty;
  selected: boolean;
}

export interface AssessedRequirementDto extends RequirementDto {
  proficiency: Proficiency | null;
  factor: number;
  contribution: number;
}

export interface RequirementDefinitionDto extends SkillDto {
  importance: Importance;
  weight: number;
  targetLevel: Difficulty;
}

export interface LearningStepDto {
  skill: SkillDto;
  status: 'known' | 'developing' | 'next' | 'later' | 'target';
}

export interface LearningPathDto {
  targetSkill: SkillDto;
  steps: LearningStepDto[];
  isDirectTarget: boolean;
  explanation: string;
}

export interface CoveredSkillDto {
  slug: string;
  name: string;
  weight: number;
}

export interface RecommendedProjectDto {
  project: ProjectDto;
  coveredSkills: CoveredSkillDto[];
  coverageCount: number;
  coverageWeight: number;
  practicalScore: number;
  reason: string;
}

export interface SharedSkillDto {
  slug: string;
  name: string;
  weight: number;
}

export interface SimilarRoleDto {
  role: RoleDto;
  sharedSkills: SharedSkillDto[];
  sharedSkillCount: number;
  sharedWeight: number;
  explanation: string;
}
