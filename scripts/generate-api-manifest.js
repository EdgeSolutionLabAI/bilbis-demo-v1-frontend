#!/usr/bin/env node
/**
 * Audits FE source for all outbound HTTP calls to the backend and writes
 * api-manifest.json. Commit that file; CI fails on drift (manifest:check).
 *
 * Run manually after adding / changing an endpoint:
 *   node scripts/generate-api-manifest.js
 *
 * CI drift gate:
 *   node scripts/generate-api-manifest.js && git diff --exit-code api-manifest.json
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIRS = ['app', 'features'];

function* walkTs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkTs(full);
    } else if (/\.[tj]sx?$/.test(entry.name)) {
      yield full;
    }
  }
}

/**
 * Returns all { method, path, source } entries found in a single source file.
 * Matches fetch(`${ENV_VAR}/api/v1/<path>`) and checks the surrounding 300
 * characters for an explicit method override (defaults to GET).
 */
function extractEndpoints(src, relativePath) {
  const results = [];
  const re = /fetch\(`\$\{[^}]+\}(\/api\/v1\/[^`\s]+)/g;
  for (const m of src.matchAll(re)) {
    const apiPath = m[1];
    // Look ahead up to 300 chars for a `method: 'VERB'` override.
    const window = src.slice(m.index, m.index + 300);
    const methodMatch = window.match(/method:\s*['"](\w+)['"]/);
    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
    results.push({ method, path: apiPath, source: relativePath });
  }
  return results;
}

const endpoints = [];

for (const dir of SOURCE_DIRS) {
  const absDir = path.join(ROOT, dir);
  try {
    for (const file of walkTs(absDir)) {
      const src = fs.readFileSync(file, 'utf8');
      const rel = file.slice(ROOT.length + 1);
      endpoints.push(...extractEndpoints(src, rel));
    }
  } catch {
    // dir may not exist in every environment — skip
  }
}

// Deduplicate then sort for a stable, reviewable diff.
const seen = new Set();
const unique = endpoints.filter(({ method, path: p }) => {
  const key = `${method}:${p}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
unique.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

const manifest = {
  generatedAt: new Date().toISOString().slice(0, 10),
  endpoints: unique,
};

const outPath = path.join(ROOT, 'api-manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`api-manifest.json written — ${unique.length} endpoint(s).`);
for (const e of unique) {
  console.log(`  ${e.method.padEnd(6)} ${e.path}  (${e.source})`);
}
