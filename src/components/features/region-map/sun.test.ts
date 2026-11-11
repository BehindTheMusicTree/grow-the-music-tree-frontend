import { describe, expect, it } from "vitest";
import { cameraFromMatrix, dot, length, type Vec3 } from "./moon";
import { orbitRotation, perspective } from "./starfield";
import { SUN_ANGULAR_RADIUS, subsolarPoint, sunDirectionAt, sunLightPosition } from "./sun";

const DEG = Math.PI / 180;
const DEFAULT_VIEW = { lng: 0, lat: 44 };
const DATE = new Date("2024-11-03T12:00:00Z");
const SUN_DIRECTION = sunDirectionAt(DATE);
const FOV = (36.87 * Math.PI) / 180;
const ASPECT = 16 / 9;

/** Column-major product `a · b`. */
function multiply(a: ArrayLike<number>, b: ArrayLike<number>): number[] {
  const out = new Array<number>(16).fill(0);
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 4; row++) for (let k = 0; k < 4; k++) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
  return out;
}

const translateZ = (z: number) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z, 1];

type Camera = { lng: number; lat: number; bearing: number; pitch: number; roll: number };

function globeMatrix(distance: number, camera: Camera) {
  return multiply(perspective(FOV, ASPECT, 0.1, 500), multiply(translateZ(-distance), orbitRotation(camera)));
}

/** The Sun is a direction (w = 0 in the shader): project it with the globe translation dropped. */
function projectSun(matrix: ArrayLike<number>, dir: Vec3) {
  const at = (row: number) => matrix[row] * dir[0] + matrix[4 + row] * dir[1] + matrix[8 + row] * dir[2];
  return { x: at(0) / at(3), y: at(1) / at(3), w: at(3) };
}

/** MapLibre's `getSunPos` for a map-anchored light, from `light.position`. */
function maplibreSun([r, azimuthal, polar]: [number, number, number], camera: Camera): Vec3 {
  const az = (azimuthal + 90) * DEG;
  const pl = polar * DEG;
  const cart: Vec3 = [r * Math.cos(az) * Math.sin(pl), r * Math.sin(az) * Math.sin(pl), r * Math.cos(pl)];
  const m = orbitRotation(camera);
  const v: Vec3 = [-cart[0], -cart[1], -cart[2]];
  return [
    m[0] * v[0] + m[4] * v[1] + m[8] * v[2],
    m[1] * v[0] + m[5] * v[1] + m[9] * v[2],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2],
  ];
}

describe("subsolarPoint", () => {
  it.each([
    ["June solstice 2024", "2024-06-20T20:51:00Z", 23.44],
    ["December solstice 2024", "2024-12-21T09:20:00Z", -23.44],
    ["March equinox 2025", "2025-03-20T09:01:00Z", 0],
  ])("has the right latitude at the %s", (_name, iso, lat) => {
    expect(Math.abs(subsolarPoint(new Date(iso)).lat - lat)).toBeLessThan(0.05);
  });

  it("applies the equation of time: 16.4 min ahead of the mean Sun on 3 November", () => {
    expect(Math.abs(subsolarPoint(DATE).lng - -4.1)).toBeLessThan(0.3);
  });

  it("moves 15° west per hour", () => {
    const a = subsolarPoint(new Date("2024-11-03T12:00:00Z")).lng;
    const b = subsolarPoint(new Date("2024-11-03T13:00:00Z")).lng;
    expect(Math.abs(((a - b + 540) % 360) - 180 - 15)).toBeLessThan(0.01);
  });

  it("stays in [-180, 180)", () => {
    for (let h = 0; h < 48; h++) {
      const { lng } = subsolarPoint(new Date(Date.UTC(2024, 10, 3, h)));
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThan(180);
    }
  });
});

describe("sunDirectionAt", () => {
  it("is a unit vector", () => {
    expect(length(sunDirectionAt(DATE))).toBeCloseTo(1, 6);
  });
});

describe("SUN_ANGULAR_RADIUS", () => {
  it("matches the Moon's apparent size (~0.78°)", () => {
    expect(SUN_ANGULAR_RADIUS / DEG).toBeCloseTo(0.78, 1);
  });
});

describe("sunLightPosition", () => {
  it("stays within MapLibre's expected ranges", () => {
    const [r, azimuthal, polar] = sunLightPosition(SUN_DIRECTION);
    expect(r).toBe(1);
    expect(azimuthal).toBeGreaterThanOrEqual(0);
    expect(azimuthal).toBeLessThan(360);
    expect(polar).toBeGreaterThanOrEqual(0);
    expect(polar).toBeLessThanOrEqual(180);
  });

  it.each([
    ["opening view", { ...DEFAULT_VIEW, bearing: 0, pitch: 0, roll: 0 }],
    ["rotated", { lng: 40, lat: -10, bearing: 35, pitch: 50, roll: 0 }],
    ["far side", { lng: -150, lat: 20, bearing: -80, pitch: 10, roll: 5 }],
  ])("round-trips through MapLibre's light math (%s)", (_name, camera) => {
    const found = maplibreSun(sunLightPosition(SUN_DIRECTION), camera);
    const m = orbitRotation(camera);
    const expected: Vec3 = [
      m[0] * SUN_DIRECTION[0] + m[4] * SUN_DIRECTION[1] + m[8] * SUN_DIRECTION[2],
      m[1] * SUN_DIRECTION[0] + m[5] * SUN_DIRECTION[1] + m[9] * SUN_DIRECTION[2],
      m[2] * SUN_DIRECTION[0] + m[6] * SUN_DIRECTION[1] + m[10] * SUN_DIRECTION[2],
    ];
    for (let i = 0; i < 3; i++) expect(found[i]).toBeCloseTo(expected[i], 5);
  });
});

describe("Sun visibility", () => {
  it("shows beside the globe disc from a camera on the Sun's side", () => {
    // Look 25° off the sub-solar point, so the Sun sits next to the disc.
    const lat = Math.asin(SUN_DIRECTION[1]) / DEG;
    const lng = Math.atan2(SUN_DIRECTION[0], SUN_DIRECTION[2]) / DEG;
    const matrix = globeMatrix(5.9, { lng: lng + 180, lat: -lat, bearing: 0, pitch: 0, roll: 0 });
    const { w } = projectSun(matrix, SUN_DIRECTION);
    // Camera on the antipode looks toward the Sun: it is in front (w > 0) and near the centre, behind the globe.
    expect(w).toBeGreaterThan(0);
    const off = globeMatrix(5.9, { lng: lng + 180 + 25, lat: -lat, bearing: 0, pitch: 0, roll: 0 });
    const shown = projectSun(off, SUN_DIRECTION);
    expect(shown.w).toBeGreaterThan(0);
    expect(Math.abs(shown.x)).toBeLessThan(1);
    expect(Math.abs(shown.y)).toBeLessThan(1);
    // Not masked by the globe: the angle between the Sun and the globe centre, seen from the camera, exceeds the globe's angular radius.
    const camera = cameraFromMatrix(off);
    const toCentre = camera.map((c) => -c / length(camera)) as Vec3;
    expect(Math.acos(dot(SUN_DIRECTION, toCentre))).toBeGreaterThan(Math.asin(1 / length(camera)));
  });
});
