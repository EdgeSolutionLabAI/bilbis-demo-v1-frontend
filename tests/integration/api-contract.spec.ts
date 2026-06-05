import { test, expect } from '@playwright/test';
import { apiClient, request, API_BASE_URL } from '../../lib/api-client';

interface Match {
  id: string;
  team1: string;
  team2: string;
  time: string;
  event: string;
  format: string;
}

// CORS origin the backend must allow — the deployed FE origin.
const FE_ORIGIN =
  process.env.FE_ORIGIN ?? 'https://bilbis-demo-v1-frontend.vercel.app';

// ---------------------------------------------------------------------------
// GET /health — pre-flight smoke before the full suite.
// Expected: 200 { status: "ok" }. If BE hasn't added this yet (404), we log
// and skip — the endpoint addition is tracked separately.
// ---------------------------------------------------------------------------
test.describe('GET /health', () => {
  test('returns 200 { status: "ok" } or documents missing endpoint', async () => {
    const { status, data } = await apiClient.health();
    if (status === 404) {
      console.info(
        '[KAI-66] /health returned 404 — add GET /health → 200 { status: "ok" } to BE'
      );
      return;
    }
    expect(status).toBe(200);
    expect(data).toMatchObject({ status: 'ok' });
  });
});

test.describe('GET /matches/today', () => {
  test('returns a non-cacheable array payload', async () => {
    const { status, data, headers } = await request<Match[]>('/matches/today', {
      cache: 'no-store',
      headers: { Origin: FE_ORIGIN },
    });

    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);

    const cacheControl = headers['cache-control'] ?? '';
    expect(cacheControl).toMatch(/no-store|max-age=60|s-maxage=60/);

    for (const match of data ?? []) {
      expect(match).toMatchObject({
        id: expect.any(String),
        team1: expect.any(String),
        team2: expect.any(String),
        time: expect.any(String),
        event: expect.any(String),
        format: expect.any(String),
      });
    }
  });
});

test.describe('GET /api/v1/meta/version', () => {
  test('returns 200 with expected shape', async () => {
    const { status, data } = await apiClient.metaVersion();
    expect(status).toBe(200);
    expect(data).toMatchObject({
      version: expect.any(String),
      commit: expect.any(String),
      buildTime: expect.any(String),
    });
  });

  test('CORS header allows FE origin', async () => {
    const { headers } = await apiClient.metaVersion({
      headers: { Origin: FE_ORIGIN },
    });
    const acao = headers['access-control-allow-origin'];
    // Backend may echo the exact origin or use a wildcard — both are acceptable.
    expect(acao).toMatch(/bilbis-demo-v1-frontend\.vercel\.app|\*/);
  });
});

test.describe('GET /api/v1/presence/active', () => {
  test('returns 200 with expected shape', async () => {
    const { status, data } = await apiClient.presenceActive();
    expect(status).toBe(200);
    expect(data).toMatchObject({
      activeCount: expect.any(Number),
    });
  });

  test('CORS header allows FE origin', async () => {
    const { headers } = await apiClient.presenceActive({
      headers: { Origin: FE_ORIGIN },
    });
    const acao = headers['access-control-allow-origin'];
    expect(acao).toMatch(/bilbis-demo-v1-frontend\.vercel\.app|\*/);
  });
});

test.describe('POST /api/v1/presence/heartbeat', () => {
  test('returns 2xx with valid visitorId', async () => {
    const { status } = await apiClient.presenceHeartbeat({
      visitorId: 'playwright-contract-test',
    });
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(300);
  });

  test('CORS header allows FE origin', async () => {
    const { headers } = await apiClient.presenceHeartbeat(
      { visitorId: 'playwright-contract-test' },
      { headers: { Origin: FE_ORIGIN } }
    );
    const acao = headers['access-control-allow-origin'];
    expect(acao).toMatch(/bilbis-demo-v1-frontend\.vercel\.app|\*/);
  });

  test('returns 4xx for missing visitorId — documents actual error shape', async () => {
    const { status, data } = await request(
      '/api/v1/presence/heartbeat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    );
    // If shapes drift from { error: { code, message } }, file a normalization ticket.
    console.info(
      `[KAI-66] error shape for missing visitorId — status=${status} body=${JSON.stringify(data)}`
    );
    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).toBeLessThan(500);
  });

  test('returns 4xx for empty body', async () => {
    const url = `${API_BASE_URL}/api/v1/presence/heartbeat`;
    const start = Date.now();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '',
    });
    console.info(
      `[KAI-66] error shape for empty body — status=${res.status} latency=${Date.now() - start}ms`
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------
// OPTIONS preflight — browsers send this before cross-origin requests.
// The backend must respond with an Access-Control-Allow-Origin that covers
// the deployed FE origin, otherwise browsers will block the actual request.
// ---------------------------------------------------------------------------
test.describe('CORS OPTIONS preflight', () => {
  const preflightHeaders = {
    Origin: FE_ORIGIN,
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'content-type',
  };

  for (const path of ['/api/v1/meta/version', '/api/v1/presence/active']) {
    test(`OPTIONS ${path} returns CORS allow-origin`, async () => {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'OPTIONS',
        headers: preflightHeaders,
      });
      // Preflight may be answered by the router (200/204) or the actual handler (200).
      expect([200, 204]).toContain(res.status);
      const acao = res.headers.get('access-control-allow-origin');
      expect(acao).toMatch(/bilbis-demo-v1-frontend\.vercel\.app|\*/);
    });
  }

  test('OPTIONS /api/v1/presence/heartbeat returns CORS allow-origin', async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/presence/heartbeat`, {
      method: 'OPTIONS',
      headers: {
        Origin: FE_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    expect([200, 204]).toContain(res.status);
    const acao = res.headers.get('access-control-allow-origin');
    expect(acao).toMatch(/bilbis-demo-v1-frontend\.vercel\.app|\*/);
  });
});
