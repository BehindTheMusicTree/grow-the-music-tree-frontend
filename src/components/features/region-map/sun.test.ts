import { describe, expect, it } from "vitest";
import { cameraFromMatrix, DEFAULT_VIEW, dot, length, moonBodyFrame, moonCenter, type Vec3 } from "./moon";
import { orbitRotation, perspective } from "./starfield";
import { SUN_ANGULAR_RADIUS, SUN_DIRECTION, sunLightPosition } from "./sun";

const DEG = Math.PI / 180;
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

describe("SUN_DIRECTION", () => {
  it("is a unit vector", () => {
    expect(length(SUN_DIRECTION)).toBeCloseTo(1, 6);
  });

  it("lies 130° from the Moon as seen from Earth, on the far side", () => {
    const moon = moonCenter();
    const toMoon = moon.map((c) => c / length(moon)) as Vec3;
    expect(Math.acos(dot(SUN_DIRECTION, toMoon)) / DEG).toBeCloseTo(130, 4);
  });

  it("keeps the Moon gibbous: lit fraction between 0.75 and 0.9", () => {
    const frame = moonBodyFrame(moonCenter());
    const lit = (1 + dot(SUN_DIRECTION, frame.z)) / 2;
    expect(lit).toBeGreaterThan(0.75);
    expect(lit).toBeLessThan(0.9);
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
  it("is behind the camera in the opening view", () => {
    const matrix = globeMatrix(5.9, { ...DEFAULT_VIEW, bearing: 0, pitch: 0, roll: 0 });
    expect(projectSun(matrix, SUN_DIRECTION).w).toBeLessThanOrEqual(0);
  });

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
