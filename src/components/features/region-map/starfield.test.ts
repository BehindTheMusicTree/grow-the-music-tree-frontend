import { describe, expect, it } from "vitest";
import {
  generateStars,
  orbitRotation,
  STAR_COUNT,
  STAR_SEED,
  STAR_STRIDE,
  starfieldMatrix,
  type OrbitCamera,
} from "./starfield";

const FOV = Math.PI / 6;
const CENTER: OrbitCamera = { lng: 30, lat: 20, bearing: 0, pitch: 0, roll: 0 };
const DEG = Math.PI / 180;

/** Globe-frame unit vector of a lng/lat, the convention MapLibre uses for its globe. */
const surface = (lng: number, lat: number): [number, number, number] => [
  Math.sin(lng * DEG) * Math.cos(lat * DEG),
  Math.sin(lat * DEG),
  Math.cos(lng * DEG) * Math.cos(lat * DEG),
];

const apply = (m: Float32Array, [x, y, z]: [number, number, number]) => ({
  x: m[0] * x + m[4] * y + m[8] * z + m[12],
  y: m[1] * x + m[5] * y + m[9] * z + m[13],
  w: m[3] * x + m[7] * y + m[11] * z + m[15],
});

const ndc = (camera: OrbitCamera, dir: [number, number, number]) => {
  const p = apply(starfieldMatrix(camera, FOV, 1), dir);
  return { x: p.x / p.w, y: p.y / p.w, w: p.w };
};

describe("generateStars", () => {
  const stars = generateStars(STAR_COUNT, STAR_SEED);

  it("is deterministic for a seed and differs across seeds", () => {
    expect(generateStars(STAR_COUNT, STAR_SEED)).toEqual(stars);
    expect(generateStars(STAR_COUNT, STAR_SEED + 1)).not.toEqual(stars);
  });

  it("holds STAR_STRIDE floats per star", () => {
    expect(stars).toHaveLength(STAR_COUNT * STAR_STRIDE);
  });

  it("places every star on the unit sphere with size and brightness in range", () => {
    for (let i = 0; i < STAR_COUNT; i++) {
      const [x, y, z, size, brightness] = Array.from(stars.subarray(i * STAR_STRIDE, (i + 1) * STAR_STRIDE));
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 5);
      expect(size).toBeGreaterThanOrEqual(1);
      expect(size).toBeLessThanOrEqual(2.5);
      expect(brightness).toBeGreaterThan(0);
      expect(brightness).toBeLessThanOrEqual(1);
    }
  });

  it("is balanced across the sphere", () => {
    let north = 0;
    let east = 0;
    let front = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      if (stars[i * STAR_STRIDE + 2] > 0) north++;
      if (stars[i * STAR_STRIDE] > 0) east++;
      if (stars[i * STAR_STRIDE + 1] > 0) front++;
    }
    for (const half of [north, east, front]) expect(Math.abs(half / STAR_COUNT - 0.5)).toBeLessThan(0.05);
  });

  it("keeps most stars dim", () => {
    let dim = 0;
    for (let i = 0; i < STAR_COUNT; i++) if (stars[i * STAR_STRIDE + 4] < 0.5) dim++;
    expect(dim / STAR_COUNT).toBeGreaterThan(0.6);
  });
});

describe("orbitRotation", () => {
  it("is orthonormal", () => {
    const m = orbitRotation({ lng: 40, lat: -25, bearing: 33, pitch: 12, roll: 7 });
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        const dot = m[a * 4] * m[b * 4] + m[a * 4 + 1] * m[b * 4 + 1] + m[a * 4 + 2] * m[b * 4 + 2];
        expect(dot).toBeCloseTo(a === b ? 1 : 0, 5);
      }
    }
  });

  it("sends the map centre to +Z, toward the camera", () => {
    const view = apply(orbitRotation(CENTER), surface(CENTER.lng, CENTER.lat));
    expect(view.x).toBeCloseTo(0, 5);
    expect(view.y).toBeCloseTo(0, 5);
    expect(view.w).toBeCloseTo(1, 5);
  });
});

describe("starfieldMatrix", () => {
  it("projects the antipode of the centre to the middle of the screen, in front of the camera", () => {
    const antipode = surface(CENTER.lng + 180, -CENTER.lat);
    const p = ndc(CENTER, antipode);
    expect(p.x).toBeCloseTo(0, 5);
    expect(p.y).toBeCloseTo(0, 5);
    expect(p.w).toBeGreaterThan(0);
  });

  it("puts the zenith above the centre behind the camera", () => {
    expect(ndc(CENTER, surface(CENTER.lng, CENTER.lat)).w).toBeLessThan(0);
  });

  it("turns the sky rigidly with the globe when the camera moves east", () => {
    const eastCamera = { ...CENTER, lng: CENTER.lng + 5 };
    const near = surface(CENTER.lng + 60, CENTER.lat);
    const far = surface(CENTER.lng + 180 + 10, -CENTER.lat);
    // Near side drifts left like the globe surface; the far side drifts the opposite way.
    expect(apply(orbitRotation(eastCamera), near).x).toBeLessThan(apply(orbitRotation(CENTER), near).x);
    expect(ndc(eastCamera, far).x).toBeGreaterThan(ndc(CENTER, far).x);
  });

  it("turns the sky rigidly with the globe when the camera moves north", () => {
    const northCamera = { ...CENTER, lat: CENTER.lat + 5 };
    const near = surface(CENTER.lng, CENTER.lat + 30);
    const far = surface(CENTER.lng + 180, -CENTER.lat + 10);
    expect(apply(orbitRotation(northCamera), near).y).toBeLessThan(apply(orbitRotation(CENTER), near).y);
    expect(ndc(northCamera, far).y).toBeGreaterThan(ndc(CENTER, far).y);
  });

  it("turns north toward the left for a positive bearing, as MapLibre does", () => {
    const north: [number, number, number] = [0, 1, 0];
    const view = apply(orbitRotation({ lng: 0, lat: 0, bearing: 40, pitch: 0, roll: 0 }), north);
    expect(view.x).toBeCloseTo(-Math.sin(40 * DEG), 5);
    expect(view.y).toBeCloseTo(Math.cos(40 * DEG), 5);
  });

  it("rotates stars around the screen centre with bearing", () => {
    const star = surface(CENTER.lng + 180 + 10, -CENTER.lat);
    const before = ndc(CENTER, star);
    const after = ndc({ ...CENTER, bearing: 40 }, star);
    expect(Math.hypot(after.x, after.y)).toBeCloseTo(Math.hypot(before.x, before.y), 5);
    expect(after.x).not.toBeCloseTo(before.x, 2);
  });

  it("is continuous across the antimeridian", () => {
    const star = surface(179.9, 10);
    const east = ndc({ lng: 179.9, lat: 0, bearing: 0, pitch: 0, roll: 0 }, star);
    const west = ndc({ lng: -180.1, lat: 0, bearing: 0, pitch: 0, roll: 0 }, star);
    expect(west.x).toBeCloseTo(east.x, 5);
    expect(west.y).toBeCloseTo(east.y, 5);
  });
});
