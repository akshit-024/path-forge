import type { Difficulty, GraphResponse, Importance, RoleRequirement } from '../../types/domain';

const difficulties = new Set<Difficulty>(['foundation', 'intermediate', 'advanced']);
const importanceLevels = new Set<Importance>(['core', 'supporting']);

function asDifficulty(value: string | undefined): Difficulty | null {
  return value && difficulties.has(value as Difficulty) ? (value as Difficulty) : null;
}

function asImportance(value: string | undefined): Importance | null {
  return value && importanceLevels.has(value as Importance) ? (value as Importance) : null;
}

export function extractRoleRequirements(graph: GraphResponse): RoleRequirement[] {
  const roleId = `Role:${graph.role.slug}`;
  const skillNodes = new Map(
    graph.nodes
      .filter((node) => node.data.type === 'skill')
      .map((node) => [node.data.id, node.data] as const),
  );
  const requirements = new Map<string, RoleRequirement>();

  for (const edge of graph.edges) {
    if (edge.data.type !== 'REQUIRES' || edge.data.source !== roleId) continue;

    const skill = skillNodes.get(edge.data.target);
    const difficulty = asDifficulty(skill?.difficulty);
    if (!skill || difficulty === null) continue;

    requirements.set(skill.slug, {
      slug: skill.slug,
      name: skill.label,
      category: skill.category,
      description: skill.description ?? '',
      difficulty,
      importance: asImportance(edge.data.importance),
      weight: typeof edge.data.weight === 'number' ? edge.data.weight : null,
      targetLevel: asDifficulty(edge.data.targetLevel),
    });
  }

  const importanceOrder: Record<Importance, number> = { core: 0, supporting: 1 };
  return [...requirements.values()].sort(
    (left, right) =>
      (left.importance === null ? 2 : importanceOrder[left.importance]) -
        (right.importance === null ? 2 : importanceOrder[right.importance]) ||
      (right.weight ?? 0) - (left.weight ?? 0) ||
      left.name.localeCompare(right.name),
  );
}
