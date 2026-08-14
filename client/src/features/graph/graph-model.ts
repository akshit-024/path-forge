import type { GraphEdge, GraphNode, GraphNodeType, GraphResponse } from '../../types/domain';

export interface GraphRelatedNode {
  id: string;
  type: GraphNodeType;
  label: string;
  slug: string;
}

export interface GraphRequirementDetails {
  importance?: string;
  weight?: number;
  targetLevel?: string;
}

export interface GraphNodeDetails {
  node: GraphNode['data'];
  directRequirementCount?: number;
  parentRole?: GraphRelatedNode;
  selectedRoleRequirement?: GraphRequirementDetails;
  selectedTrackRequirement?: GraphRequirementDetails;
  prerequisites: GraphRelatedNode[];
  projects: GraphRelatedNode[];
  builtSkills: GraphRelatedNode[];
}

function relatedNodes(
  nodeById: ReadonlyMap<string, GraphNode['data']>,
  ids: Iterable<string>,
  expectedType: GraphNodeType,
): GraphRelatedNode[] {
  const related = new Map<string, GraphRelatedNode>();

  for (const id of ids) {
    const node = nodeById.get(id);
    if (!node || node.type !== expectedType) continue;

    related.set(node.id, {
      id: node.id,
      type: node.type,
      label: node.label,
      slug: node.slug,
    });
  }

  return [...related.values()].sort(
    (left, right) => left.label.localeCompare(right.label) || left.id.localeCompare(right.id),
  );
}

export function getGraphNodeDetails(graph: GraphResponse, nodeId: string): GraphNodeDetails | null {
  const nodeById = new Map(graph.nodes.map(({ data }) => [data.id, data] as const));
  const node = nodeById.get(nodeId);
  if (!node) return null;

  const details: GraphNodeDetails = {
    node,
    prerequisites: [],
    projects: [],
    builtSkills: [],
  };

  if (node.type === 'role') {
    details.directRequirementCount = relatedNodes(
      nodeById,
      graph.edges
        .filter(({ data }) => data.type === 'REQUIRES' && data.source === node.id)
        .map(({ data }) => data.target),
      'skill',
    ).length;
    return details;
  }

  if (node.type === 'track') {
    details.directRequirementCount = relatedNodes(
      nodeById,
      graph.edges
        .filter(({ data }) => data.type === 'REQUIRES' && data.source === node.id)
        .map(({ data }) => data.target),
      'skill',
    ).length;
    details.parentRole = relatedNodes(
      nodeById,
      graph.edges
        .filter(({ data }) => data.type === 'HAS_TRACK' && data.target === node.id)
        .map(({ data }) => data.source),
      'role',
    )[0];
    return details;
  }

  if (node.type === 'skill') {
    const selectedRoleNode = graph.nodes.find(
      ({ data }) => data.type === 'role' && data.slug === graph.role.slug,
    );
    const requirement = graph.edges
      .filter(
        ({ data }) =>
          data.type === 'REQUIRES' &&
          data.source === selectedRoleNode?.data.id &&
          data.target === node.id,
      )
      .sort((left, right) => left.data.id.localeCompare(right.data.id))[0];

    if (requirement) {
      details.selectedRoleRequirement = {
        importance: requirement.data.importance,
        weight: requirement.data.weight,
        targetLevel: requirement.data.targetLevel,
      };
    }

    const selectedTrackNode = graph.track
      ? graph.nodes.find(
          ({ data }) => data.type === 'track' && data.slug === graph.track?.slug,
        )
      : undefined;
    const trackRequirement = graph.edges
      .filter(
        ({ data }) =>
          data.type === 'REQUIRES' &&
          data.source === selectedTrackNode?.data.id &&
          data.target === node.id,
      )
      .sort((left, right) => left.data.id.localeCompare(right.data.id))[0];

    if (trackRequirement) {
      details.selectedTrackRequirement = {
        importance: trackRequirement.data.importance,
        weight: trackRequirement.data.weight,
        targetLevel: trackRequirement.data.targetLevel,
      };
    }

    details.prerequisites = relatedNodes(
      nodeById,
      graph.edges
        .filter(({ data }) => data.type === 'PREREQUISITE_FOR' && data.target === node.id)
        .map(({ data }) => data.source),
      'skill',
    );
    details.projects = relatedNodes(
      nodeById,
      graph.edges
        .filter(({ data }) => data.type === 'BUILDS' && data.target === node.id)
        .map(({ data }) => data.source),
      'project',
    );
    return details;
  }

  if (node.type === 'project') {
    details.builtSkills = relatedNodes(
      nodeById,
      graph.edges
        .filter(({ data }) => data.type === 'BUILDS' && data.source === node.id)
        .map(({ data }) => data.target),
      'skill',
    );
  }
  return details;
}

export function getGraphSemanticRanks(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number> {
  const nodeById = new Map(nodes.map(({ data }) => [data.id, data] as const));
  const roleRequirementIds = new Set<string>();
  const trackRequirementIds = new Set<string>();
  const incomingPrerequisiteIds = new Map<string, Set<string>>();

  for (const { data } of edges) {
    const source = nodeById.get(data.source);
    const target = nodeById.get(data.target);

    if (data.type === 'REQUIRES' && target?.type === 'skill') {
      if (source?.type === 'role') roleRequirementIds.add(target.id);
      if (source?.type === 'track') trackRequirementIds.add(target.id);
    }

    if (data.type === 'PREREQUISITE_FOR' && source?.type === 'skill' && target?.type === 'skill') {
      const incoming = incomingPrerequisiteIds.get(target.id) ?? new Set<string>();
      incoming.add(source.id);
      incomingPrerequisiteIds.set(target.id, incoming);
    }
  }

  const requirementIds = new Set([...roleRequirementIds, ...trackRequirementIds]);
  const reverseDistance = new Map<string, number>();
  const queue = [...requirementIds];
  requirementIds.forEach((id) => reverseDistance.set(id, 0));

  for (let index = 0; index < queue.length; index += 1) {
    const dependentId = queue[index];
    if (!dependentId) continue;

    const dependentDistance = reverseDistance.get(dependentId);
    if (dependentDistance === undefined) continue;

    for (const prerequisiteId of incomingPrerequisiteIds.get(dependentId) ?? []) {
      if (reverseDistance.has(prerequisiteId)) continue;
      reverseDistance.set(prerequisiteId, dependentDistance + 1);
      queue.push(prerequisiteId);
    }
  }

  const deepestPrerequisiteDistance = Math.max(0, ...reverseDistance.values());
  const directSkillRank = deepestPrerequisiteDistance + 2;
  const roleRank = directSkillRank + 1;
  const skillRanks = new Map<string, number>();
  const rankedSkillQueue: string[] = [];

  roleRequirementIds.forEach((id) => {
    skillRanks.set(id, directSkillRank);
    rankedSkillQueue.push(id);
  });
  trackRequirementIds.forEach((id) => {
    const rank = roleRequirementIds.has(id) ? directSkillRank : directSkillRank - 1;
    skillRanks.set(id, rank);
    rankedSkillQueue.push(id);
  });

  for (let index = 0; index < rankedSkillQueue.length; index += 1) {
    const dependentId = rankedSkillQueue[index];
    if (!dependentId) continue;
    const dependentRank = skillRanks.get(dependentId);
    if (dependentRank === undefined) continue;

    for (const prerequisiteId of incomingPrerequisiteIds.get(dependentId) ?? []) {
      const candidateRank = Math.max(1, dependentRank - 1);
      if ((skillRanks.get(prerequisiteId) ?? 0) >= candidateRank) continue;
      skillRanks.set(prerequisiteId, candidateRank);
      rankedSkillQueue.push(prerequisiteId);
    }
  }

  const ranks = new Map<string, number>();

  for (const { data } of nodes) {
    if (data.type === 'role') {
      ranks.set(data.id, roleRank);
      continue;
    }
    if (data.type === 'track') {
      ranks.set(data.id, directSkillRank);
      continue;
    }
    if (data.type === 'project') {
      ranks.set(data.id, 0);
      continue;
    }

    ranks.set(data.id, skillRanks.get(data.id) ?? 1);
  }

  return ranks;
}
