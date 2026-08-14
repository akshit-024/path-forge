export type Difficulty = 'foundation' | 'intermediate' | 'advanced';
export type Importance = 'core' | 'supporting';
export type Proficiency = 'learning' | 'comfortable' | 'project';

export interface CurrentSkill {
  skillSlug: string;
  proficiency: Proficiency;
}

export interface Role {
  slug: string;
  name: string;
  summary: string;
  category: string;
  experienceLevel: string;
  description: string;
}

export interface Track {
  slug: string;
  name: string;
  summary: string;
  description: string;
  category: string;
  parentRoleSlug: string;
}

export interface Skill {
  slug: string;
  name: string;
  category: string;
  description: string;
  difficulty: Difficulty;
}

export interface RequirementSkill extends Skill {
  importance: Importance;
  weight: number;
  targetLevel: Difficulty;
  selected?: boolean;
}

export interface AssessedRequirement extends RequirementSkill {
  proficiency: Proficiency | null;
  factor: number;
  contribution: number;
}

export interface RoleRequirement extends Skill {
  importance: Importance | null;
  weight: number | null;
  targetLevel: Difficulty | null;
}

export interface RoadmapStep {
  skill: Skill;
  status: 'known' | 'next' | 'later' | 'target';
}

export interface LearningPath {
  targetSkill: Skill;
  steps: RoadmapStep[];
  isDirectTarget: boolean;
  explanation: string;
}

export interface Project {
  slug: string;
  name: string;
  summary: string;
  difficulty: Difficulty;
  estimatedHours: number;
  category: string;
}

export interface CoveredSkill {
  slug: string;
  name: string;
  weight: number;
}

export interface ProjectRecommendation {
  project: Project;
  coveredSkills: CoveredSkill[];
  coverageCount: number;
  coverageWeight: number;
  practicalScore: number;
  reason: string;
}

export interface SimilarRole {
  role: Role;
  sharedSkillCount: number;
  sharedSkills: CoveredSkill[];
  sharedWeight: number;
  explanation: string;
}

export interface AnalysisExplanation {
  matchedWeight: number;
  earnedWeight: number;
  totalWeight: number;
  formula: string;
  selectedSkillCount?: number;
  proficiencyFactors: Record<Proficiency, number>;
  calculations: Array<{
    skillSlug: string;
    skillName: string;
    weight: number;
    proficiency: Proficiency | null;
    factor: number;
    contribution: number;
  }>;
}

export interface AnalysisResult {
  targetRole: Role;
  targetTrack: Track | null;
  readinessPercentage: number;
  assessedRequirements: AssessedRequirement[];
  demonstratedSkills: AssessedRequirement[];
  comfortableSkills: AssessedRequirement[];
  developingSkills: AssessedRequirement[];
  /** Legacy project-level alias retained by the API for compatibility. */
  matchedSkills: AssessedRequirement[];
  missingSkills: AssessedRequirement[];
  coreMissingSkills: AssessedRequirement[];
  supportingMissingSkills: AssessedRequirement[];
  learningPaths: LearningPath[];
  recommendedProjects: ProjectRecommendation[];
  similarRoles: SimilarRole[];
  explanation: AnalysisExplanation;
}

export type DatabaseState = 'connected' | 'unavailable' | 'not_configured';

export interface HealthResponse {
  status: string;
  database: {
    status: DatabaseState;
    message: string;
  };
}

export type GraphNodeType = 'role' | 'track' | 'skill' | 'project';
export type GraphRelationshipType = 'HAS_TRACK' | 'REQUIRES' | 'PREREQUISITE_FOR' | 'BUILDS';

export interface GraphNode {
  data: {
    id: string;
    type: GraphNodeType;
    label: string;
    slug: string;
    description?: string;
    summary?: string;
    category: string;
    difficulty?: string;
    experienceLevel?: string;
    estimatedHours?: number;
    parentRoleSlug?: string;
    requirementCount?: number;
    selected?: boolean;
    missing?: boolean;
  };
}

export interface GraphEdge {
  data: {
    id: string;
    source: string;
    target: string;
    type: GraphRelationshipType;
    label: GraphRelationshipType;
    importance?: string;
    weight?: number;
    targetLevel?: string;
    depth?: string;
  };
}

export interface GraphResponse {
  role: Role;
  track: Track | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RoleRequirementsResponse {
  role: Role;
  track: Track | null;
  requirements: RoleRequirement[];
}

export interface AnalysisRequest {
  targetRoleSlug: string;
  targetTrackSlug?: string;
  currentSkills: CurrentSkill[];
}
