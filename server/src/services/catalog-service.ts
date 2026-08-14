import type { CatalogService } from '../types/services.js';
import type { RoleRequirementsResponse } from '../types/api.js';
import type { RoleDto, SkillDto, TrackDto } from '../types/domain.js';
import { NotFoundError } from '../errors/app-error.js';
import { toRoleDto, toSkillDto, toTrackDto } from '../utils/dto.js';
import { asArray } from '../utils/objects.js';
import type { GraphRepository } from './repository.js';
import { TargetRequirementsResolver } from './target-requirements.js';

export class DefaultCatalogService implements CatalogService {
  public constructor(
    private readonly repository: GraphRepository,
    private readonly targetResolver = new TargetRequirementsResolver(repository),
  ) {}

  public async listRoles(): Promise<RoleDto[]> {
    const rows = await this.repository.listRoles();
    return rows.map((row) => toRoleDto(row.role));
  }

  public async listSkills(): Promise<SkillDto[]> {
    const rows = await this.repository.listSkills();
    return rows.map((row) => toSkillDto(row.skill));
  }

  public async listRoleTracks(roleSlug: string): Promise<TrackDto[]> {
    const rows = await this.repository.listRoleTracks(roleSlug);
    if (rows.length === 0) {
      throw new NotFoundError(`No role was found for slug "${roleSlug}".`);
    }
    return asArray(rows[0]?.tracks)
      .map(toTrackDto)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  public async getRoleRequirements(
    roleSlug: string,
    trackSlug?: string,
  ): Promise<RoleRequirementsResponse> {
    const target = await this.targetResolver.resolve(roleSlug, trackSlug);
    return {
      role: target.role,
      track: target.track,
      requirements: target.requirements,
    };
  }
}
