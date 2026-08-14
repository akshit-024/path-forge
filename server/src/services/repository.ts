import { runRead } from '../db/driver.js';
import {
  LEARNING_PATHS_QUERY,
  LIST_ROLE_TRACKS_QUERY,
  LIST_ROLES_QUERY,
  LIST_SKILLS_QUERY,
  RECOMMENDED_PROJECTS_QUERY,
  ROLE_GRAPH_NEIGHBORHOOD_QUERY,
  SIMILAR_ROLES_QUERY,
  TARGET_REQUIREMENTS_QUERY,
} from '../db/queries.js';

export interface RequirementQueryParameter {
  skillSlug: string;
  weight: number;
}

export interface GraphRepository {
  listRoles(): Promise<Record<string, unknown>[]>;
  listSkills(): Promise<Record<string, unknown>[]>;
  listRoleTracks(targetRoleSlug: string): Promise<Record<string, unknown>[]>;
  getTargetRequirements(
    targetRoleSlug: string,
    targetTrackSlug: string | null,
  ): Promise<Record<string, unknown>[]>;
  getLearningPaths(
    requirementDefinitions: RequirementQueryParameter[],
    currentSkillSlugs: string[],
  ): Promise<Record<string, unknown>[]>;
  getRecommendedProjects(
    requirementDefinitions: RequirementQueryParameter[],
    currentSkillSlugs: string[],
  ): Promise<Record<string, unknown>[]>;
  getSimilarRoles(
    targetRoleSlug: string,
    requirementDefinitions: RequirementQueryParameter[],
  ): Promise<Record<string, unknown>[]>;
  getRoleGraph(
    targetRoleSlug: string,
    requirementSkillSlugs: string[],
    currentSkillSlugs: string[],
  ): Promise<Record<string, unknown>[]>;
}

export class Neo4jGraphRepository implements GraphRepository {
  public listRoles(): Promise<Record<string, unknown>[]> {
    return runRead(LIST_ROLES_QUERY);
  }

  public listSkills(): Promise<Record<string, unknown>[]> {
    return runRead(LIST_SKILLS_QUERY);
  }

  public listRoleTracks(targetRoleSlug: string): Promise<Record<string, unknown>[]> {
    return runRead(LIST_ROLE_TRACKS_QUERY, { targetRoleSlug });
  }

  public getTargetRequirements(
    targetRoleSlug: string,
    targetTrackSlug: string | null,
  ): Promise<Record<string, unknown>[]> {
    return runRead(TARGET_REQUIREMENTS_QUERY, { targetRoleSlug, targetTrackSlug });
  }

  public getLearningPaths(
    requirementDefinitions: RequirementQueryParameter[],
    currentSkillSlugs: string[],
  ): Promise<Record<string, unknown>[]> {
    return runRead(LEARNING_PATHS_QUERY, { requirementDefinitions, currentSkillSlugs });
  }

  public getRecommendedProjects(
    requirementDefinitions: RequirementQueryParameter[],
    currentSkillSlugs: string[],
  ): Promise<Record<string, unknown>[]> {
    return runRead(RECOMMENDED_PROJECTS_QUERY, { requirementDefinitions, currentSkillSlugs });
  }

  public getSimilarRoles(
    targetRoleSlug: string,
    requirementDefinitions: RequirementQueryParameter[],
  ): Promise<Record<string, unknown>[]> {
    return runRead(SIMILAR_ROLES_QUERY, { targetRoleSlug, requirementDefinitions });
  }

  public getRoleGraph(
    targetRoleSlug: string,
    requirementSkillSlugs: string[],
    currentSkillSlugs: string[],
  ): Promise<Record<string, unknown>[]> {
    return runRead(ROLE_GRAPH_NEIGHBORHOOD_QUERY, {
      targetRoleSlug,
      requirementSkillSlugs,
      currentSkillSlugs,
    });
  }
}
