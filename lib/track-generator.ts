/**
 * Pure track-generation utilities.
 *
 * Design notes:
 *  - LCG seeded RNG keeps generation deterministic and lightweight.
 *  - Points are placed on a deformed circle then sorted by angle so the closed
 *    polygon never self-intersects (star-shaped w.r.t. the centroid).
 *  - Catmull-Rom interpolation produces smooth, camera-ready curves without any
 *    extra libraries.
 */

export interface Point {
  x: number;
  y: number;
}

/** Minimal linear-congruential generator — fast, seedable, no deps. */
export function makePrng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    // LCG constants from Numerical Recipes
    s = Math.imul(1664525, s) + 1013904223;
    s >>>= 0;
    return s / 0x100000000;
  };
}

/** Generate N control points for the track loop. */
export function generateControlPoints(
  seed: number,
  opts: {
    count?: number;
    cx?: number;
    cy?: number;
    baseRadius?: number;
    radiusJitter?: number;
    angleJitter?: number;
  } = {},
): Point[] {
  const {
    count = 14,
    cx = 0,
    cy = 0,
    baseRadius = 1,
    radiusJitter = 0.35,
    angleJitter = 0.55,
  } = opts;

  const rand = makePrng(seed);

  // Evenly spaced base angles, then jitter each one
  const points: Point[] = [];
  const step = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    const baseAngle = i * step;
    const a = baseAngle + (rand() - 0.5) * angleJitter * step;
    const r = baseRadius * (1 + (rand() - 0.5) * radiusJitter * 2);
    points.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }

  // Sort by angle around centroid to guarantee a non-self-intersecting loop
  const avgX = points.reduce((s, p) => s + p.x, 0) / count;
  const avgY = points.reduce((s, p) => s + p.y, 0) / count;
  points.sort(
    (a, b) =>
      Math.atan2(a.y - avgY, a.x - avgX) - Math.atan2(b.y - avgY, b.x - avgX),
  );

  return points;
}

/**
 * Interpolate a single Catmull-Rom segment between p1→p2 with neighbours p0,p3.
 * Returns `steps` evenly-spaced points on the segment (not including p2 itself,
 * so callers can concatenate segments without duplicating shared endpoints).
 */
function catmullRomSegment(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  steps: number,
): Point[] {
  const result: Point[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const t2 = t * t;
    const t3 = t2 * t;
    const x =
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
    const y =
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
    result.push({ x, y });
  }
  return result;
}

/**
 * Build a smooth closed spline from control points using Catmull-Rom.
 * `stepsPerSegment` controls how many interpolated points per control-point gap.
 */
export function buildSpline(
  controls: Point[],
  stepsPerSegment = 20,
): Point[] {
  const n = controls.length;
  const spline: Point[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = controls[(i - 1 + n) % n];
    const p1 = controls[i];
    const p2 = controls[(i + 1) % n];
    const p3 = controls[(i + 2) % n];
    spline.push(...catmullRomSegment(p0, p1, p2, p3, stepsPerSegment));
  }
  return spline;
}

/**
 * Scale and translate spline points to fill a canvas rect with padding.
 * Returns a new array — input is not mutated.
 */
export function fitToCanvas(
  points: Point[],
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
): Point[] {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const dataW = maxX - minX || 1;
  const dataH = maxY - minY || 1;

  const drawW = canvasWidth - padding * 2;
  const drawH = canvasHeight - padding * 2;

  // Uniform scale to preserve aspect ratio
  const scale = Math.min(drawW / dataW, drawH / dataH);

  const scaledW = dataW * scale;
  const scaledH = dataH * scale;
  const offsetX = padding + (drawW - scaledW) / 2;
  const offsetY = padding + (drawH - scaledH) / 2;

  return points.map((p) => ({
    x: (p.x - minX) * scale + offsetX,
    y: (p.y - minY) * scale + offsetY,
  }));
}
