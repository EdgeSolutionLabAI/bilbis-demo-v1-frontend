<!-- Frontend repository for bilbis-demo-v1 -->
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Integration tests (KAI-66)

Playwright-based tests verify that the frontend correctly communicates with the
backend across all critical flows. Tests cover API contracts, CORS headers,
error states, and cold-start latency.

### Run against a local backend

```bash
# 1. Start the backend (in the bilbis-demo-v1-backend repo)
pnpm dev   # → listens on http://localhost:3000 (check console for actual port)

# 2. Install Playwright browsers (first time only)
npx playwright install --with-deps chromium

# 3. Run all integration tests against localhost
API_BASE_URL=http://localhost:3000 npm run test:integration

# 4. Open the interactive UI runner
API_BASE_URL=http://localhost:3000 npm run test:integration:ui
```

### Run against Vercel deployments

```bash
# Preview (default — matches CI on push)
npm run test:integration

# Production
API_BASE_URL=https://bilbis-demo-v1-backend.vercel.app \
BASE_URL=https://bilbis-demo-v1-frontend.vercel.app \
npm run test:integration
```

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `API_BASE_URL` | `https://bilbis-demo-v1-backend.vercel.app` | Backend base URL for API contract and performance tests |
| `BASE_URL` | `https://bilbis-demo-v1-frontend.vercel.app` | Frontend base URL for happy-path page navigation |
| `FE_ORIGIN` | `https://bilbis-demo-v1-frontend.vercel.app` | `Origin` header used in CORS assertions |

### CI triggers

| Event | Target |
|---|---|
| Push to `main` / `master` | Vercel preview (default `API_BASE_URL`) |
| Nightly (`cron 03:00 UTC`) | Production |
| `workflow_dispatch` | Configurable via inputs |

Reports are uploaded as artifacts on failure. Find them under the **Actions** tab
→ **Integration tests** → **playwright-report**.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
