import { test, expect } from '@playwright/test';
import { apiClient, API_BASE_URL } from '../../lib/api-client';

// Acceptance criterion: no endpoint cold-start > 3 s.
// These tests fire against the real backend (API_BASE_URL).
// Retries are disabled for this file — a retry on a slow request would hide
// the real latency and let a cold-start budget violation pass unnoticed.
test.describe.configure({ retries: 0 });

const COLD_START_BUDGET_MS = 3_000;

// Warm-up is intentionally omitted so the first request captures cold-start
// latency when the Vercel function was previously idle.

test('GET /api/v1/meta/version responds within budget', async () => {
  const { status, latencyMs } = await apiClient.metaVersion();
  console.info(
    `[perf] GET /api/v1/meta/version — ${latencyMs}ms (status ${status})`
  );
  expect(latencyMs).toBeLessThanOrEqual(COLD_START_BUDGET_MS);
  expect(status).toBeLessThan(500);
});

test('GET /api/v1/presence/active responds within budget', async () => {
  const { status, latencyMs } = await apiClient.presenceActive();
  console.info(
    `[perf] GET /api/v1/presence/active — ${latencyMs}ms (status ${status})`
  );
  expect(latencyMs).toBeLessThanOrEqual(COLD_START_BUDGET_MS);
  expect(status).toBeLessThan(500);
});

test('POST /api/v1/presence/heartbeat responds within budget', async () => {
  const { status, latencyMs } = await apiClient.presenceHeartbeat({
    visitorId: 'playwright-perf-test',
  });
  console.info(
    `[perf] POST /api/v1/presence/heartbeat — ${latencyMs}ms (status ${status})`
  );
  expect(latencyMs).toBeLessThanOrEqual(COLD_START_BUDGET_MS);
  expect(status).toBeLessThan(500);
});

test('GET /health responds within budget (if available)', async () => {
  const { status, latencyMs } = await apiClient.health();
  if (status === 404) {
    console.info('[perf] GET /health — not found (404), skipping budget check');
    return;
  }
  console.info(`[perf] GET /health — ${latencyMs}ms (status ${status})`);
  expect(latencyMs).toBeLessThanOrEqual(COLD_START_BUDGET_MS);
  expect(status).toBeLessThan(500);
});

test('records full latency summary across all endpoints', async () => {
  const [meta, active, heartbeat, health] = await Promise.all([
    apiClient.metaVersion().then((r) => ({ path: '/api/v1/meta/version', ...r })),
    apiClient.presenceActive().then((r) => ({ path: '/api/v1/presence/active', ...r })),
    apiClient
      .presenceHeartbeat({ visitorId: 'playwright-perf-summary' })
      .then((r) => ({ path: '/api/v1/presence/heartbeat', ...r })),
    apiClient.health().then((r) => ({ path: '/health', ...r })),
  ]);

  // Health endpoint may not exist yet — include in summary but don't enforce budget.
  const allResults = [meta, active, heartbeat];
  if (health.status !== 404) allResults.push(health);

  const summary = allResults.map(({ path, status, latencyMs }) => ({
    path,
    status,
    latencyMs,
    withinBudget: latencyMs <= COLD_START_BUDGET_MS,
  }));

  console.info(`[perf] summary target=${API_BASE_URL}\n${JSON.stringify(summary, null, 2)}`);

  for (const entry of summary) {
    expect(entry.withinBudget, `${entry.path} exceeded ${COLD_START_BUDGET_MS}ms (${entry.latencyMs}ms)`).toBe(true);
  }
});
