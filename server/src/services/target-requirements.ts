import { NotFoundError } from '../errors/app-error.js';
import type {
  RequirementDefinitionDto,
  RequirementDto,
  RoleDto,
  TrackDto,
} from '../types/domain.js';
import { toRoleDto, toSkillDto, toTrackDto } from '../utils/dto.js';
import { asArray, asNumber, asRecord, asString } from '../utils/objects.js';
import type { GraphRepository, RequirementQueryParameter } from './repository.js';

export interface ResolvedTargetRequirements {
  role: RoleDto;
  track: TrackDto | null;
  baseRequirements: RequirementDefinitionDto[];
  trackRequirements: RequirementDefinitionDto[];
  requirements: RequirementDefinitionDto[];
}

const targetLevelRank = { foundation: 0, intermediate: 1, advanced: 2 } as const;

export class TargetRequirementsResolver {
  public constructor(private readonly repository: GraphRepository) {}

  public async resolve(roleSlug: string, trackSlug?: string): Promise<ResolvedTargetRequirements> {
    const rows = await this.repository.getTargetRequirements(roleSlug, trackSlug ?? null);
    if (rows.length === 0) {
      throw new NotFoundError(
        trackSlug
          ? `No track "${trackSlug}" was found for role "${roleSlug}".`
          : `No role was found for slug "${roleSlug}".`,
      );
    }

    const row = rows[0] as Record<string, unknown>;
    const role = toRoleDto(row.role);
    const track = row.track === null || row.track === undefined ? null : toTrackDto(row.track);
    if (track && track.parentRoleSlug !== role.slug) {
      throw new NotFoundError(`No track ${track.slug} was found for role ${role.slug}.`);
    }
    const baseRequirements = sortRequirements(parseRequirementItems(row.baseRequirements));
    const trackRequirements = sortRequirements(parseRequirementItems(row.trackRequirements));
    return {
      role,
      track,
      baseRequirements,
      trackRequirements,
      requirements: combineRequirementDefinitions(baseRequirements, trackRequirements),
    };
  }
}

export function combineRequirementDefinitions(
  baseRequirements: RequirementDefinitionDto[],
  trackRequirements: RequirementDefinitionDto[],
): RequirementDefinitionDto[] {
  const combined = new Map<string, RequirementDefinitionDto>();
  for (const requirement of [...baseRequirements, ...trackRequirements]) {
    const existing = combined.get(requirement.slug);
    if (!existing) {
      combined.set(requirement.slug, { ...requirement });
      continue;
    }
    combined.set(requirement.slug, {
      ...existing,
      importance:
        existing.importance === 'core' || requirement.importance === 'core' ? 'core' : 'supporting',
      weight: Math.max(existing.weight, requirement.weight),
      targetLevel:
        targetLevelRank[requirement.targetLevel] > targetLevelRank[existing.targetLevel]
          ? requirement.targetLevel
          : existing.targetLevel,
    });
  }
  return sortRequirements([...combined.values()]);
}

export function selectRequirements(
  definitions: RequirementDefinitionDto[],
  currentSkillSlugs: string[],
): RequirementDto[] {
  const selected = new Set(currentSkillSlugs);
  return definitions.map((requirement) => ({
    ...requirement,
    selected: selected.has(requirement.slug),
  }));
}

export function toRequirementQueryParameters(
  definitions: RequirementDefinitionDto[],
): RequirementQueryParameter[] {
  return definitions.map((requirement) => ({
    skillSlug: requirement.slug,
    weight: requirement.weight,
  }));
}

function parseRequirementItems(value: unknown): RequirementDefinitionDto[] {
  return asArray(value)
    .filter((item) => item !== null && item !== undefined)
    .map((item) => {
      const record = asRecord(item, 'requirement item');
      const relationship = asRecord(record.relationship, 'REQUIRES relationship');
      const importance = asString(relationship.importance, 'requirement.importance');
      const targetLevel = asString(relationship.targetLevel, 'requirement.targetLevel');
      if (importance !== 'core' && importance !== 'supporting') {
        throw new Error(`Unexpected requirement importance: ${importance}`);
      }
      if (
        targetLevel !== 'foundation' &&
        targetLevel !== 'intermediate' &&
        targetLevel !== 'advanced'
      ) {
        throw new Error(`Unexpected target level: ${targetLevel}`);
      }
      return {
        ...toSkillDto(record.skill),
        importance,
        weight: asNumber(relationship.weight, 'requirement.weight'),
        targetLevel,
      };
    });
}

function sortRequirements(requirements: RequirementDefinitionDto[]): RequirementDefinitionDto[] {
  return [...requirements].sort(
    (left, right) =>
      (left.importance === right.importance ? 0 : left.importance === 'core' ? -1 : 1) ||
      right.weight - left.weight ||
      targetLevelRank[right.targetLevel] - targetLevelRank[left.targetLevel] ||
      left.name.localeCompare(right.name),
  );
}
