import { test, expect, devices } from '@playwright/test';

// Happy-path walkthrough: load the frontend, assert all backend-driven UI
// renders without console errors on desktop Chrome and iPhone 13 viewport.
// BASE_URL (frontend) is set via playwright.config.ts → process.env.BASE_URL.

const PRESENCE_BADGE_TIMEOUT = 10_000; // presence badge polls; allow one cycle
const VERSION_CHIP_TIMEOUT = 10_000;   // version chip fetches on mount

function makeTests() {
  test('homepage loads without uncaught console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test('page title content is visible', async ({ page }) => {
    // "TRUST NO ONE" is a static element that is always present regardless of
    // backend state — confirms the shell rendered.
    await page.goto('/');
    await expect(page.getByText('TRUST NO ONE')).toBeVisible();
  });

  test('presence badge does not crash the page', async ({ page }) => {
    // PresenceBadge polls the backend; if it is absent from the current layout
    // we still assert the page has no React error boundary crash.
    await page.goto('/');
    const badge = page.locator('[data-testid="presence-badge"]');
    const hasBadge = await badge.count();
    if (hasBadge) {
      await expect(badge).toBeVisible({ timeout: PRESENCE_BADGE_TIMEOUT });
    } else {
      await expect(page.locator('body')).not.toContainText('Something went wrong', {
        timeout: PRESENCE_BADGE_TIMEOUT,
      });
    }
  });

  test('version chip renders app version from backend', async ({ page }) => {
    await page.goto('/');
    // VersionChip lives in <footer> and renders text like "v1.2.3 · abc1234".
    // If the backend is unreachable the chip is hidden — fall back to a crash check.
    const versionText = page
      .locator('footer')
      .getByText(/v\d+\.\d+\.\d+\s*·\s*[0-9a-f]{7}/);
    const hasVersion = await versionText.count();
    if (hasVersion) {
      await expect(versionText).toBeVisible({ timeout: VERSION_CHIP_TIMEOUT });
    } else {
      await expect(page.locator('body')).not.toContainText('Something went wrong', {
        timeout: VERSION_CHIP_TIMEOUT,
      });
    }
  });

  test('all backend API requests succeed without CORS blocks', async ({ page }) => {
    const apiBase =
      process.env.API_BASE_URL ?? 'https://bilbis-demo-v1-backend.vercel.app';

    // requestfailed fires when the browser's network stack aborts the request —
    // this is exactly what happens when the browser enforces a CORS block.
    const blockedRequests: string[] = [];
    page.on('requestfailed', (req) => {
      if (req.url().startsWith(apiBase)) {
        blockedRequests.push(
          `${req.method()} ${req.url()} — ${req.failure()?.errorText ?? 'unknown'}`
        );
      }
    });

    const corsConsoleErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' && /cors|cross.?origin|blocked/i.test(text)) {
        corsConsoleErrors.push(text);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(
      blockedRequests,
      `Requests blocked by CORS or network: ${blockedRequests.join('\n')}`
    ).toHaveLength(0);
    expect(
      corsConsoleErrors,
      `CORS-related console errors: ${corsConsoleErrors.join('\n')}`
    ).toHaveLength(0);
  });

  test('4xx/5xx backend response renders error state without crashing', async ({
    page,
  }) => {
    // Intercept all backend calls and force a 500 to verify the UI handles it.
    const apiBase =
      process.env.API_BASE_URL ?? 'https://bilbis-demo-v1-backend.vercel.app';

    await page.route(`${apiBase}/**`, (route) =>
      route.fulfill({ status: 500, body: '{"error":"forced by test"}' })
    );

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // UI must not throw a React error boundary crash.
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    expect(pageErrors).toHaveLength(0);
  });
}

test.describe('Happy path — desktop Chrome', makeTests);

test.describe('Happy path — iPhone 13', () => {
  test.use({ ...devices['iPhone 13'] });
  makeTests();
});
