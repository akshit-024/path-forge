import type {
  AssessedRequirementDto,
  CurrentSkillDto,
  LearningPathDto,
  Proficiency,
  RecommendedProjectDto,
  RequirementDefinitionDto,
  RoleDto,
  SimilarRoleDto,
  SkillDto,
  TrackDto,
} from './domain.js';

export interface SuccessEnvelope<T> {
  data: T;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface HealthResponse {
  status: 'ok';
  database: {
    status: 'connected' | 'unavailable' | 'not_configured';
    message: string;
  };
  timestamp: string;
}

export interface AnalysisRequest {
  targetRoleSlug: string;
  targetTrackSlug?: string;
  currentSkills: CurrentSkillDto[];
}

export interface RequirementCalculationDto {
  skillSlug: string;
  skillName: string;
  weight: number;
  proficiency: Proficiency | null;
  factor: number;
  contribution: number;
}

export interface AnalysisResponse {
  targetRole: RoleDto;
  targetTrack: TrackDto | null;
  readinessPercentage: number;
  assessedRequirements: AssessedRequirementDto[];
  demonstratedSkills: AssessedRequirementDto[];
  comfortableSkills: AssessedRequirementDto[];
  developingSkills: AssessedRequirementDto[];
  matchedSkills: AssessedRequirementDto[];
  missingSkills: AssessedRequirementDto[];
  coreMissingSkills: AssessedRequirementDto[];
  supportingMissingSkills: AssessedRequirementDto[];
  learningPaths: LearningPathDto[];
  recommendedProjects: RecommendedProjectDto[];
  similarRoles: SimilarRoleDto[];
  explanation: {
    matchedWeight: number;
    earnedWeight: number;
    totalWeight: number;
    formula: string;
    selectedSkillCount: number;
    proficiencyFactors: Record<Proficiency, number>;
    calculations: RequirementCalculationDto[];
  };
}

export interface ComparisonTargetInput {
  roleSlug: string;
  trackSlug?: string;
}

export interface ComparisonRequest {
  targets: ComparisonTargetInput[];
  currentSkills: CurrentSkillDto[];
}

export interface ComparisonTargetResult {
  targetKey: string;
  analysis: AnalysisResponse;
  totalRequirementCount: number;
  additionalSkillsNeeded: AssessedRequirementDto[];
  transitionPath: LearningPathDto | null;
}

export interface ComparisonFailure {
  targetKey: string;
  target: ComparisonTargetInput;
  code: string;
  message: string;
}

export interface ComparisonSharedSkill {
  skill: SkillDto;
  targetKeys: string[];
}

export interface ComparisonUniqueSkills {
  targetKey: string;
  skills: AssessedRequirementDto[];
}

export interface ComparisonResponse {
  results: ComparisonTargetResult[];
  failures: ComparisonFailure[];
  sharedSkills: ComparisonSharedSkill[];
  uniqueSkillsByTarget: ComparisonUniqueSkills[];
}

export type GraphNodeType = 'role' | 'track' | 'skill' | 'project';
export type GraphEdgeType = 'HAS_TRACK' | 'REQUIRES' | 'PREREQUISITE_FOR' | 'BUILDS';

export interface GraphNodeDto {
  data: {
    id: string;
    label: string;
    type: GraphNodeType;
    slug: string;
    category: string;
    description?: string;
    summary?: string;
    difficulty?: string;
    experienceLevel?: string;
    estimatedHours?: number;
    parentRoleSlug?: string;
    selected?: boolean;
    missing?: boolean;
  };
}

export interface GraphEdgeDto {
  data: {
    id: string;
    source: string;
    target: string;
    type: GraphEdgeType;
    label: GraphEdgeType;
    importance?: string;
    weight?: number;
    targetLevel?: string;
    depth?: string;
  };
}

export interface RoleGraphResponse {
  role: RoleDto;
  track: TrackDto | null;
  nodes: GraphNodeDto[];
  edges: GraphEdgeDto[];
}

export interface RoleRequirementsResponse {
  role: RoleDto;
  track: TrackDto | null;
  requirements: RequirementDefinitionDto[];
}

export type RolesResponse = SuccessEnvelope<RoleDto[]>;
export type SkillsResponse = SuccessEnvelope<SkillDto[]>;
export type TracksResponse = SuccessEnvelope<TrackDto[]>;
export type RoleRequirementsEnvelope = SuccessEnvelope<RoleRequirementsResponse>;
export type AnalysisEnvelope = SuccessEnvelope<AnalysisResponse>;
export type ComparisonEnvelope = SuccessEnvelope<ComparisonResponse>;
export type RoleGraphEnvelope = SuccessEnvelope<RoleGraphResponse>;
