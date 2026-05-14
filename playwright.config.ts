import { defineConfig, devices } from '@playwright/test';

// Frontend base URL (for page navigation in happy-path tests).
// Override with BASE_URL env var; defaults to Vercel preview.
const BASE_URL =
  process.env.BASE_URL ?? 'https://bilbis-demo-v1-frontend.vercel.app';

export default defineConfig({
  testDir: './tests/integration',
  // Each spec file is independent; run them in parallel.
  fullyParallel: true,
  // Fail fast on CI; allow retries locally to smooth over transient network.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Keep worker count low to avoid hammering serverless cold-start.
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: BASE_URL,
    // Capture traces on first retry so failures are easy to diagnose.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Give serverless functions time to cold-start.
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-iphone-13',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
