import type { CurrentSkill, Proficiency } from '../types/domain';

export const PROFILE_V2_KEY = 'pathforge.profile.v2';
export const LEGACY_PROFILE_KEY = 'pathforge.profile.v1';
// Keep the generic export for callers that only need the active storage key.
export const PROFILE_KEY = PROFILE_V2_KEY;

const MAX_STORED_SKILLS = 100;
const PROFICIENCIES = new Set<Proficiency>(['learning', 'comfortable', 'project']);

export interface StoredProfile {
  targetRoleSlug: string | null;
  targetTrackSlug: string | null;
  currentSkills: CurrentSkill[];
}

export const EMPTY_PROFILE: StoredProfile = {
  targetRoleSlug: null,
  targetTrackSlug: null,
  currentSkills: [],
};

function isSlug(value: unknown): value is string {
  return (
    typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 100
  );
}

function isProficiency(value: unknown): value is Proficiency {
  return typeof value === 'string' && PROFICIENCIES.has(value as Proficiency);
}

function normalizeTarget(
  candidate: Record<string, unknown>,
): Pick<StoredProfile, 'targetRoleSlug' | 'targetTrackSlug'> {
  const targetRoleSlug = isSlug(candidate.targetRoleSlug) ? candidate.targetRoleSlug : null;
  const targetTrackSlug =
    targetRoleSlug !== null && isSlug(candidate.targetTrackSlug) ? candidate.targetTrackSlug : null;

  return { targetRoleSlug, targetTrackSlug };
}

/**
 * Invalid entries are ignored. Duplicate slugs keep their first position while
 * the last valid proficiency wins, making normalization deterministic.
 */
function normalizeCurrentSkills(value: unknown): CurrentSkill[] {
  if (!Array.isArray(value)) return [];

  const normalized: CurrentSkill[] = [];
  const indexBySlug = new Map<string, number>();

  for (const entry of value.slice(0, MAX_STORED_SKILLS)) {
    if (typeof entry !== 'object' || entry === null) continue;
    const candidate = entry as Record<string, unknown>;
    if (!isSlug(candidate.skillSlug) || !isProficiency(candidate.proficiency)) continue;

    const currentSkill: CurrentSkill = {
      skillSlug: candidate.skillSlug,
      proficiency: candidate.proficiency,
    };
    const existingIndex = indexBySlug.get(currentSkill.skillSlug);
    if (existingIndex === undefined) {
      indexBySlug.set(currentSkill.skillSlug, normalized.length);
      normalized.push(currentSkill);
    } else {
      normalized[existingIndex] = currentSkill;
    }
  }

  return normalized;
}

function parseObject(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function parseStoredProfile(raw: string | null): StoredProfile {
  const candidate = parseObject(raw);
  if (!candidate) return EMPTY_PROFILE;

  return {
    ...normalizeTarget(candidate),
    currentSkills: normalizeCurrentSkills(candidate.currentSkills),
  };
}

export function parseLegacyStoredProfile(raw: string | null): StoredProfile {
  const candidate = parseObject(raw);
  if (!candidate) return EMPTY_PROFILE;

  const currentSkillSlugs = Array.isArray(candidate.currentSkillSlugs)
    ? candidate.currentSkillSlugs.slice(0, MAX_STORED_SKILLS)
    : [];
  const currentSkills = normalizeCurrentSkills(
    currentSkillSlugs.filter(isSlug).map((skillSlug) => ({
      skillSlug,
      proficiency: 'project',
    })),
  );

  return {
    ...normalizeTarget(candidate),
    currentSkills,
  };
}

function hasUsableV2Shape(raw: string | null): boolean {
  const candidate = parseObject(raw);
  return candidate !== null && Array.isArray(candidate.currentSkills);
}

export function loadProfile(): StoredProfile {
  if (typeof window === 'undefined') return EMPTY_PROFILE;

  const currentRaw = window.localStorage.getItem(PROFILE_V2_KEY);
  if (hasUsableV2Shape(currentRaw)) return parseStoredProfile(currentRaw);

  return parseLegacyStoredProfile(window.localStorage.getItem(LEGACY_PROFILE_KEY));
}

export function saveProfile(profile: StoredProfile): void {
  if (typeof window === 'undefined') return;

  // Once v2 is saved (including a reset), legacy data must not be able to
  // resurrect selections on a later page load.
  window.localStorage.removeItem(LEGACY_PROFILE_KEY);

  if (profile.targetRoleSlug === null && profile.currentSkills.length === 0) {
    window.localStorage.removeItem(PROFILE_V2_KEY);
    return;
  }

  const normalizedProfile: StoredProfile = {
    ...normalizeTarget(profile as unknown as Record<string, unknown>),
    currentSkills: normalizeCurrentSkills(profile.currentSkills),
  };
  window.localStorage.setItem(PROFILE_V2_KEY, JSON.stringify(normalizedProfile));
}
