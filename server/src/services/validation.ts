import { z } from 'zod';

import { ValidationError } from '../errors/app-error.js';
import type { AnalysisRequest } from '../types/api.js';
import type { CurrentSkillDto } from '../types/domain.js';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'A slug is required.')
  .max(80, 'Slugs cannot exceed 80 characters.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase kebab-case slug.');

const proficiencySchema = z.enum(['learning', 'comfortable', 'project']);

const currentSkillSchema = z
  .object({
    skillSlug: slugSchema,
    proficiency: proficiencySchema,
  })
  .strict();

export const analysisRequestSchema = z
  .object({
    targetRoleSlug: slugSchema,
    targetTrackSlug: slugSchema.optional(),
    currentSkillSlugs: z.array(slugSchema).max(50, 'Select at most 50 skills.').optional(),
    currentSkills: z.array(currentSkillSchema).max(50, 'Select at most 50 skills.').optional(),
  })
  .strict()
  .superRefine((input, context) => {
    const hasLegacySkills = input.currentSkillSlugs !== undefined;
    const hasProficiencySkills = input.currentSkills !== undefined;
    if (hasLegacySkills === hasProficiencySkills) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide exactly one of currentSkillSlugs or currentSkills.',
        path: ['currentSkills'],
      });
    }

    const proficiencyBySlug = new Map<string, string>();
    for (const [index, skill] of (input.currentSkills ?? []).entries()) {
      const existing = proficiencyBySlug.get(skill.skillSlug);
      if (existing !== undefined && existing !== skill.proficiency) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Conflicting proficiency values were provided for ${skill.skillSlug}.`,
          path: ['currentSkills', index, 'proficiency'],
        });
      } else {
        proficiencyBySlug.set(skill.skillSlug, skill.proficiency);
      }
    }
  })
  .transform((input): AnalysisRequest => {
    const currentSkills = input.currentSkills
      ? normalizeCurrentSkills(input.currentSkills)
      : normalizeSkillSlugs(input.currentSkillSlugs ?? []).map((skillSlug): CurrentSkillDto => ({
          skillSlug,
          proficiency: 'project',
        }));
    return {
      targetRoleSlug: input.targetRoleSlug,
      ...(input.targetTrackSlug ? { targetTrackSlug: input.targetTrackSlug } : {}),
      currentSkills,
    };
  });

export function normalizeSkillSlugs(slugs: string[]): string[] {
  return [...new Set(slugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean))];
}

export function normalizeCurrentSkills(skills: CurrentSkillDto[]): CurrentSkillDto[] {
  const unique = new Map<string, CurrentSkillDto>();
  for (const skill of skills) {
    const skillSlug = skill.skillSlug.trim().toLowerCase();
    if (!unique.has(skillSlug)) unique.set(skillSlug, { ...skill, skillSlug });
  }
  return [...unique.values()];
}

export function parseAnalysisRequest(value: unknown): AnalysisRequest {
  const result = analysisRequestSchema.safeParse(value);
  if (!result.success) {
    throw new ValidationError('The analysis request is invalid.', result.error.flatten());
  }
  return result.data;
}

export function parseRoleSlug(value: unknown): string {
  const result = slugSchema.safeParse(value);
  if (!result.success) {
    throw new ValidationError('The role slug is invalid.', result.error.flatten());
  }
  return result.data;
}

export function parseOptionalTrackSlug(value: unknown): string | undefined {
  if (value === undefined || value === '') return undefined;
  const result = slugSchema.safeParse(value);
  if (!result.success) {
    throw new ValidationError('The track slug is invalid.', result.error.flatten());
  }
  return result.data;
}

export function parseCurrentSkillsQuery(value: unknown): string[] {
  if (value === undefined || value === '') return [];
  if (typeof value !== 'string') {
    throw new ValidationError('currentSkillSlugs must be a comma-delimited string.');
  }
  if (value.length > 2_000) {
    throw new ValidationError('currentSkillSlugs is too long.');
  }

  const pieces = value.split(',');
  if (pieces.length > 50) {
    throw new ValidationError('Select at most 50 skills.');
  }
  const parsed = z.array(slugSchema).safeParse(pieces.map((piece) => piece.trim()).filter(Boolean));
  if (!parsed.success) {
    throw new ValidationError(
      'currentSkillSlugs contains an invalid slug.',
      parsed.error.flatten(),
    );
  }
  return normalizeSkillSlugs(parsed.data);
}
