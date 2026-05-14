// API client for integration tests.
// Reads API_BASE_URL from the environment so tests can target any tier:
//   - local dev:  API_BASE_URL=http://localhost:3000
//   - CI:         API_BASE_URL=https://bilbis-demo-v1-backend.vercel.app  (preview/prod)
// Matches the endpoints the frontend hooks call via NEXT_PUBLIC_BACKEND_URL.

export const API_BASE_URL =
  process.env.API_BASE_URL ?? 'https://bilbis-demo-v1-backend.vercel.app';

export interface AppVersion {
  version: string;
  commit: string;
  buildTime: string;
}

export interface ActivePresence {
  activeCount: number;
}

export interface HeartbeatPayload {
  visitorId: string;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  latencyMs: number;
  headers: Record<string, string>;
}

export async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;
  const start = Date.now();
  const res = await fetch(url, init);
  const latencyMs = Date.now() - start;

  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let data: T | null = null;
  try {
    data = (await res.json()) as T;
  } catch {
    // Non-JSON body — leave data as null
  }

  return { data, status: res.status, latencyMs, headers };
}

export const apiClient = {
  metaVersion: (extraInit?: RequestInit) =>
    request<AppVersion>('/api/v1/meta/version', extraInit),

  presenceActive: (extraInit?: RequestInit) =>
    request<ActivePresence>('/api/v1/presence/active', extraInit),

  presenceHeartbeat: (payload: HeartbeatPayload, extraInit?: RequestInit) =>
    request('/api/v1/presence/heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(extraInit?.headers as Record<string, string> | undefined),
      },
      body: JSON.stringify(payload),
      ...extraInit,
    }),
};
