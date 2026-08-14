import { NotFoundError } from '../errors/app-error.js';
import type { GraphEdgeDto, GraphNodeDto, RoleGraphResponse } from '../types/api.js';
import type { RequirementDefinitionDto } from '../types/domain.js';
import type { GraphService } from '../types/services.js';
import { toProjectDto, toSkillDto } from '../utils/dto.js';
import { asArray, asRecord, asString } from '../utils/objects.js';
import type { GraphRepository } from './repository.js';
import { TargetRequirementsResolver } from './target-requirements.js';

export class DefaultGraphService implements GraphService {
  public constructor(
    private readonly repository: GraphRepository,
    private readonly targetResolver = new TargetRequirementsResolver(repository),
  ) {}

  public async getRoleGraph(
    roleSlug: string,
    currentSkillSlugs: string[],
    trackSlug?: string,
  ): Promise<RoleGraphResponse> {
    const target = await this.targetResolver.resolve(roleSlug, trackSlug);
    const rows = await this.repository.getRoleGraph(
      roleSlug,
      target.requirements.map((requirement) => requirement.slug),
      currentSkillSlugs,
    );
    if (rows.length === 0) {
      throw new NotFoundError(`No role was found for slug "${roleSlug}".`);
    }

    const row = rows[0] as Record<string, unknown>;
    const role = target.role;
    const selected = new Set(currentSkillSlugs);
    const nodes = new Map<string, GraphNodeDto>();
    const edges = new Map<string, GraphEdgeDto>();
    const roleId = `Role:${role.slug}`;
    nodes.set(roleId, {
      data: {
        id: roleId,
        label: role.name,
        type: 'role',
        slug: role.slug,
        category: role.category,
        summary: role.summary,
        description: role.description,
        experienceLevel: role.experienceLevel,
      },
    });

    for (const requirement of target.baseRequirements) {
      addRequirement(nodes, edges, roleId, requirement, selected);
    }

    if (target.track) {
      const trackId = `Track:${target.track.slug}`;
      nodes.set(trackId, {
        data: {
          id: trackId,
          label: target.track.name,
          type: 'track',
          slug: target.track.slug,
          category: target.track.category,
          summary: target.track.summary,
          description: target.track.description,
          parentRoleSlug: target.track.parentRoleSlug,
        },
      });
      const hasTrackEdgeId = `${roleId}|HAS_TRACK|${trackId}`;
      edges.set(hasTrackEdgeId, {
        data: {
          id: hasTrackEdgeId,
          source: roleId,
          target: trackId,
          type: 'HAS_TRACK',
          label: 'HAS_TRACK',
        },
      });
      for (const requirement of target.trackRequirements) {
        addRequirement(nodes, edges, trackId, requirement, selected);
      }
    }

    for (const value of asArray(row.prerequisitePaths)) {
      if (value === null) continue;
      const path = asRecord(value, 'prerequisite path');
      const pathSkills = asArray(path.skills).map(toSkillDto);
      pathSkills.forEach((skill) => addSkill(nodes, skill, selected, false));
      for (let index = 0; index < pathSkills.length - 1; index += 1) {
        const before = pathSkills[index];
        const after = pathSkills[index + 1];
        if (!before || !after) continue;
        const source = `Skill:${before.slug}`;
        const target = `Skill:${after.slug}`;
        const edgeId = `${source}|PREREQUISITE_FOR|${target}`;
        edges.set(edgeId, {
          data: {
            id: edgeId,
            source,
            target,
            type: 'PREREQUISITE_FOR',
            label: 'PREREQUISITE_FOR',
          },
        });
      }
    }

    for (const value of asArray(row.projectMatches)) {
      if (value === null) continue;
      const item = asRecord(value, 'project match');
      const project = toProjectDto(item.project);
      const skill = toSkillDto(item.skill);
      const relationship = asRecord(item.relationship, 'BUILDS relationship');
      const projectId = `Project:${project.slug}`;
      const skillId = addSkill(nodes, skill, selected, true);
      nodes.set(projectId, {
        data: {
          id: projectId,
          label: project.name,
          type: 'project',
          slug: project.slug,
          category: project.category,
          summary: project.summary,
          difficulty: project.difficulty,
          estimatedHours: project.estimatedHours,
        },
      });
      const edgeId = `${projectId}|BUILDS|${skillId}`;
      edges.set(edgeId, {
        data: {
          id: edgeId,
          source: projectId,
          target: skillId,
          type: 'BUILDS',
          label: 'BUILDS',
          depth: asString(relationship.depth, 'depth'),
        },
      });
    }

    return {
      role,
      track: target.track,
      nodes: [...nodes.values()],
      edges: [...edges.values()],
    };
  }
}

function addRequirement(
  nodes: Map<string, GraphNodeDto>,
  edges: Map<string, GraphEdgeDto>,
  sourceId: string,
  requirement: RequirementDefinitionDto,
  selected: Set<string>,
): void {
  const skillId = addSkill(nodes, requirement, selected, true);
  const edgeId = `${sourceId}|REQUIRES|${skillId}`;
  edges.set(edgeId, {
    data: {
      id: edgeId,
      source: sourceId,
      target: skillId,
      type: 'REQUIRES',
      label: 'REQUIRES',
      importance: requirement.importance,
      weight: requirement.weight,
      targetLevel: requirement.targetLevel,
    },
  });
}

function addSkill(
  nodes: Map<string, GraphNodeDto>,
  skill: ReturnType<typeof toSkillDto>,
  selected: Set<string>,
  required: boolean,
): string {
  const id = `Skill:${skill.slug}`;
  const existing = nodes.get(id);
  nodes.set(id, {
    data: {
      ...existing?.data,
      id,
      label: skill.name,
      type: 'skill',
      slug: skill.slug,
      category: skill.category,
      description: skill.description,
      difficulty: skill.difficulty,
      selected: selected.has(skill.slug),
      missing: required ? !selected.has(skill.slug) : (existing?.data.missing ?? false),
    },
  });
  return id;
}
