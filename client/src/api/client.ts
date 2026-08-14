import type { ApiEnvelope, ApiErrorBody } from '../types/api';
import type {
  AnalysisRequest,
  AnalysisResult,
  GraphResponse,
  HealthResponse,
  Role,
  RoleRequirementsResponse,
  Skill,
  Track,
} from '../types/domain';

const API_ROOT = '/api';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code = 'REQUEST_FAILED', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function isEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return typeof value === 'object' && value !== null && 'data' in value;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_ROOT}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(
      'PathForge could not reach the application server. Check that it is running, then try again.',
      0,
      'NETWORK_ERROR',
    );
  }

  const body = (await response.json().catch(() => null)) as
    ApiEnvelope<T> | ApiErrorBody | T | null;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    const message =
      errorBody?.error?.message ??
      errorBody?.message ??
      (response.status === 503
        ? 'The career graph is currently unavailable. Check the database configuration and try again.'
        : 'Something went wrong while loading PathForge.');
    throw new ApiError(
      message,
      response.status,
      errorBody?.error?.code ?? `HTTP_${response.status}`,
      errorBody?.error?.details,
    );
  }

  if (body === null) {
    throw new ApiError('The server returned an empty response.', response.status, 'EMPTY_RESPONSE');
  }

  return isEnvelope<T>(body) ? body.data : (body as T);
}

export const pathforgeApi = {
  getHealth(signal?: AbortSignal) {
    return request<HealthResponse>('/health', { signal });
  },
  getRoles(signal?: AbortSignal) {
    return request<Role[]>('/roles', { signal });
  },
  getSkills(signal?: AbortSignal) {
    return request<Skill[]>('/skills', { signal });
  },
  getRoleTracks(roleSlug: string, signal?: AbortSignal) {
    return request<Track[]>(`/roles/${encodeURIComponent(roleSlug)}/tracks`, { signal });
  },
  getRoleRequirements(roleSlug: string, trackSlug?: string, signal?: AbortSignal) {
    const search = new URLSearchParams();
    if (trackSlug) search.set('trackSlug', trackSlug);
    const query = search.size > 0 ? `?${search.toString()}` : '';
    return request<RoleRequirementsResponse>(
      `/roles/${encodeURIComponent(roleSlug)}/requirements${query}`,
      { signal },
    );
  },
  analyze(input: AnalysisRequest, signal?: AbortSignal) {
    return request<AnalysisResult>('/analysis', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    });
  },
  getRoleGraph(
    roleSlug: string,
    currentSkillSlugs: string[],
    targetTrackSlug?: string,
    signal?: AbortSignal,
  ) {
    const search = new URLSearchParams();
    if (currentSkillSlugs.length > 0) {
      search.set('currentSkillSlugs', currentSkillSlugs.join(','));
    }
    if (targetTrackSlug) search.set('trackSlug', targetTrackSlug);
    const query = search.size > 0 ? `?${search.toString()}` : '';
    return request<GraphResponse>(`/graph/roles/${encodeURIComponent(roleSlug)}${query}`, {
      signal,
    });
  },
};
