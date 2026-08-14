import type {
  AnalysisRequest,
  AnalysisResponse,
  HealthResponse,
  RoleGraphResponse,
  RoleRequirementsResponse,
} from './api.js';
import type { RoleDto, SkillDto, TrackDto } from './domain.js';

export interface HealthService {
  getHealth(): Promise<HealthResponse>;
}

export interface CatalogService {
  listRoles(): Promise<RoleDto[]>;
  listSkills(): Promise<SkillDto[]>;
  listRoleTracks(roleSlug: string): Promise<TrackDto[]>;
  getRoleRequirements(roleSlug: string, trackSlug?: string): Promise<RoleRequirementsResponse>;
}

export interface AnalysisService {
  analyze(input: AnalysisRequest): Promise<AnalysisResponse>;
}

export interface GraphService {
  getRoleGraph(
    roleSlug: string,
    currentSkillSlugs: string[],
    trackSlug?: string,
  ): Promise<RoleGraphResponse>;
}

export interface AppServices {
  health: HealthService;
  catalog: CatalogService;
  analysis: AnalysisService;
  graph: GraphService;
}
