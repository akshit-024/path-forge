import { afterEach, describe, expect, it, vi } from 'vitest';
import { pathforgeApi } from './client';

afterEach(() => {
  vi.unstubAllGlobals();
});

function successfulResponse(data: unknown): Response {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('pathforgeApi specialization requests', () => {
  it('sends canonical proficiency entries in analysis requests', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(successfulResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await pathforgeApi.analyze({
      targetRoleSlug: 'backend-developer',
      targetTrackSlug: 'python-fastapi',
      currentSkills: [
        { skillSlug: 'python', proficiency: 'project' },
        { skillSlug: 'sql', proficiency: 'comfortable' },
      ],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/analysis',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          targetRoleSlug: 'backend-developer',
          targetTrackSlug: 'python-fastapi',
          currentSkills: [
            { skillSlug: 'python', proficiency: 'project' },
            { skillSlug: 'sql', proficiency: 'comfortable' },
          ],
        }),
      }),
    );
  });

  it('loads tracks and combined requirements from role-scoped endpoints', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(successfulResponse([]))
      .mockResolvedValueOnce(successfulResponse({ role: {}, track: null, requirements: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await pathforgeApi.getRoleTracks('full-stack-developer');
    await pathforgeApi.getRoleRequirements('full-stack-developer', 'mern');

    expect(fetchMock.mock.calls.map(([path]) => path)).toEqual([
      '/api/roles/full-stack-developer/tracks',
      '/api/roles/full-stack-developer/requirements?trackSlug=mern',
    ]);
  });

  it('uses the same trackSlug query key for a track-scoped graph', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(successfulResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await pathforgeApi.getRoleGraph('backend-developer', ['python', 'sql'], 'python-fastapi');

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      '/api/graph/roles/backend-developer?currentSkillSlugs=python%2Csql&trackSlug=python-fastapi',
    );
  });
});
