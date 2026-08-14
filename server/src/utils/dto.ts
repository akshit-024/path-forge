import type { ProjectDto, RoleDto, SkillDto, TrackDto } from '../types/domain.js';
import { asNumber, asRecord, asString } from './objects.js';

export function toRoleDto(value: unknown): RoleDto {
  const role = asRecord(value, 'role');
  return {
    slug: asString(role.slug, 'role.slug'),
    name: asString(role.name, 'role.name'),
    summary: asString(role.summary, 'role.summary'),
    category: asString(role.category, 'role.category'),
    experienceLevel: asString(role.experienceLevel, 'role.experienceLevel'),
    description: asString(role.description, 'role.description'),
  };
}

export function toTrackDto(value: unknown): TrackDto {
  const track = asRecord(value, 'track');
  return {
    slug: asString(track.slug, 'track.slug'),
    name: asString(track.name, 'track.name'),
    summary: asString(track.summary, 'track.summary'),
    description: asString(track.description, 'track.description'),
    category: asString(track.category, 'track.category'),
    parentRoleSlug: asString(track.parentRoleSlug, 'track.parentRoleSlug'),
  };
}

export function toSkillDto(value: unknown): SkillDto {
  const skill = asRecord(value, 'skill');
  const difficulty = asString(skill.difficulty, 'skill.difficulty');
  if (!(['foundation', 'intermediate', 'advanced'] as const).includes(difficulty as never)) {
    throw new Error(`Unexpected skill difficulty: ${difficulty}`);
  }
  return {
    slug: asString(skill.slug, 'skill.slug'),
    name: asString(skill.name, 'skill.name'),
    category: asString(skill.category, 'skill.category'),
    description: asString(skill.description, 'skill.description'),
    difficulty: difficulty as SkillDto['difficulty'],
  };
}

export function toProjectDto(value: unknown): ProjectDto {
  const project = asRecord(value, 'project');
  const difficulty = asString(project.difficulty, 'project.difficulty');
  if (!(['foundation', 'intermediate', 'advanced'] as const).includes(difficulty as never)) {
    throw new Error(`Unexpected project difficulty: ${difficulty}`);
  }
  return {
    slug: asString(project.slug, 'project.slug'),
    name: asString(project.name, 'project.name'),
    summary: asString(project.summary, 'project.summary'),
    difficulty: difficulty as ProjectDto['difficulty'],
    estimatedHours: asNumber(project.estimatedHours, 'project.estimatedHours'),
    category: asString(project.category, 'project.category'),
  };
}
