import {
  EMPTY_PROFILE,
  LEGACY_PROFILE_KEY,
  loadProfile,
  parseLegacyStoredProfile,
  parseStoredProfile,
  PROFILE_V2_KEY,
  saveProfile,
} from './storage';

describe('profile persistence', () => {
  beforeEach(() => window.localStorage.clear());

  it('loads a valid v2 profile and normalizes duplicate proficiency values deterministically', () => {
    expect(
      parseStoredProfile(
        JSON.stringify({
          targetRoleSlug: 'backend-developer',
          targetTrackSlug: 'python-fastapi',
          currentSkills: [
            { skillSlug: 'python', proficiency: 'learning' },
            { skillSlug: 'sql', proficiency: 'comfortable' },
            { skillSlug: 'python', proficiency: 'project' },
          ],
        }),
      ),
    ).toEqual({
      targetRoleSlug: 'backend-developer',
      targetTrackSlug: 'python-fastapi',
      currentSkills: [
        { skillSlug: 'python', proficiency: 'project' },
        { skillSlug: 'sql', proficiency: 'comfortable' },
      ],
    });
  });

  it('migrates valid legacy skill slugs to project experience', () => {
    const legacy = JSON.stringify({
      targetRoleSlug: 'backend-developer',
      currentSkillSlugs: ['python', '<script>', 'python', 'sql'],
    });

    expect(parseLegacyStoredProfile(legacy)).toEqual({
      targetRoleSlug: 'backend-developer',
      targetTrackSlug: null,
      currentSkills: [
        { skillSlug: 'python', proficiency: 'project' },
        { skillSlug: 'sql', proficiency: 'project' },
      ],
    });

    window.localStorage.setItem(LEGACY_PROFILE_KEY, legacy);
    expect(loadProfile().currentSkills).toEqual([
      { skillSlug: 'python', proficiency: 'project' },
      { skillSlug: 'sql', proficiency: 'project' },
    ]);
  });

  it('prefers a valid v2 profile over legacy state', () => {
    window.localStorage.setItem(
      LEGACY_PROFILE_KEY,
      JSON.stringify({ targetRoleSlug: 'ai-engineer', currentSkillSlugs: ['python'] }),
    );
    window.localStorage.setItem(
      PROFILE_V2_KEY,
      JSON.stringify({
        targetRoleSlug: 'backend-developer',
        targetTrackSlug: null,
        currentSkills: [{ skillSlug: 'sql', proficiency: 'comfortable' }],
      }),
    );

    expect(loadProfile()).toEqual({
      targetRoleSlug: 'backend-developer',
      targetTrackSlug: null,
      currentSkills: [{ skillSlug: 'sql', proficiency: 'comfortable' }],
    });
  });

  it('falls back to a valid legacy profile when v2 data is malformed', () => {
    window.localStorage.setItem(PROFILE_V2_KEY, '{not-json');
    window.localStorage.setItem(
      LEGACY_PROFILE_KEY,
      JSON.stringify({ targetRoleSlug: 'ai-engineer', currentSkillSlugs: ['python'] }),
    );

    expect(loadProfile()).toEqual({
      targetRoleSlug: 'ai-engineer',
      targetTrackSlug: null,
      currentSkills: [{ skillSlug: 'python', proficiency: 'project' }],
    });
  });

  it('filters invalid v2 entries, bounds the stored array, and sanitizes unsafe targets', () => {
    const tooMany = Array.from({ length: 105 }, (_, index) => ({
      skillSlug: `skill-${index}`,
      proficiency: 'learning',
    }));
    const parsed = parseStoredProfile(
      JSON.stringify({
        targetRoleSlug: '<script>',
        targetTrackSlug: 'python-fastapi',
        currentSkills: [
          { skillSlug: 'python', proficiency: 'expert' },
          { skillSlug: '<script>', proficiency: 'project' },
          ...tooMany,
        ],
      }),
    );

    expect(parsed.targetRoleSlug).toBeNull();
    expect(parsed.targetTrackSlug).toBeNull();
    expect(parsed.currentSkills).toHaveLength(98);
    expect(parsed.currentSkills[0]).toEqual({ skillSlug: 'skill-0', proficiency: 'learning' });
    expect(parseStoredProfile('{not-json')).toEqual(EMPTY_PROFILE);
  });

  it('removes legacy state whenever v2 is saved and clears both keys on reset', () => {
    window.localStorage.setItem(LEGACY_PROFILE_KEY, '{"currentSkillSlugs":["python"]}');
    saveProfile({
      targetRoleSlug: 'backend-developer',
      targetTrackSlug: null,
      currentSkills: [{ skillSlug: 'python', proficiency: 'comfortable' }],
    });

    expect(window.localStorage.getItem(LEGACY_PROFILE_KEY)).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(PROFILE_V2_KEY) ?? '{}')).toEqual({
      targetRoleSlug: 'backend-developer',
      targetTrackSlug: null,
      currentSkills: [{ skillSlug: 'python', proficiency: 'comfortable' }],
    });

    window.localStorage.setItem(LEGACY_PROFILE_KEY, '{"currentSkillSlugs":["sql"]}');
    saveProfile(EMPTY_PROFILE);
    expect(window.localStorage.getItem(PROFILE_V2_KEY)).toBeNull();
    expect(window.localStorage.getItem(LEGACY_PROFILE_KEY)).toBeNull();
    expect(loadProfile()).toEqual(EMPTY_PROFILE);
  });
});
