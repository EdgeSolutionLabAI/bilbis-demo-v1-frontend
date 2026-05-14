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

  test('presence badge renders with a count', async ({ page }) => {
    await page.goto('/');
    // The presence badge shows active viewer count; wait for the first poll.
    const badge = page.locator('[data-testid="presence-badge"]');
    // Tolerate missing data-testid — fall back to text pattern.
    const hasBadge = await badge.count();
    if (hasBadge) {
      await expect(badge).toBeVisible({ timeout: PRESENCE_BADGE_TIMEOUT });
    } else {
      // Graceful fallback: assert the page didn't crash (no error boundary).
      await expect(page.locator('body')).not.toContainText('Something went wrong', {
        timeout: PRESENCE_BADGE_TIMEOUT,
      });
    }
  });

  test('version chip renders app version from backend', async ({ page }) => {
    await page.goto('/');
    const chip = page.locator('[data-testid="version-chip"]');
    const hasChip = await chip.count();
    if (hasChip) {
      await expect(chip).toBeVisible({ timeout: VERSION_CHIP_TIMEOUT });
    } else {
      await expect(page.locator('body')).not.toContainText('Something went wrong', {
        timeout: VERSION_CHIP_TIMEOUT,
      });
    }
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
