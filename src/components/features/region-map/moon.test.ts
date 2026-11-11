import { describe, expect, it } from "vitest";
import {
  cameraFromMatrix,
  DEFAULT_VIEW,
  dot,
  length,
  MARIA,
  moonBasis,
  moonBodyFrame,
  moonCenter,
  moonInFront,
  MOON_DISTANCE,
  MOON_RADIUS,
  selenographicDirection,
  sunDirection,
  surfacePoint,
  type Vec3,
} from "./moon";
import { orbitRotation, perspective } from "./starfield";

const FOV = (36.87 * Math.PI) / 180;
const ASPECT = 16 / 9;
/** Camera distance from the globe centre in the opening world view (measured: globe disc ~52 % of the height). */
const WORLD_DISTANCE = 5.9;

/** Column-major product `a · b`. */
function multiply(a: ArrayLike<number>, b: ArrayLike<number>): number[] {
  const out = new Array<number>(16).fill(0);
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 4; row++) for (let k = 0; k < 4; k++) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
  return out;
}

const translateZ = (z: number) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z, 1];

/** A globe view-projection like MapLibre's: the camera sits `distance` from the globe centre along the view axis. */
function globeMatrix(distance: number, camera = { ...DEFAULT_VIEW, bearing: 0, pitch: 0, roll: 0 }) {
  const view = multiply(translateZ(-distance), orbitRotation(camera));
  return { matrix: multiply(perspective(FOV, ASPECT, 0.1, 500), view), view: orbitRotation(camera) };
}

/** Where the camera really is: the transpose of the view rotation applied to (0, 0, distance). */
const expectedCamera = (rotation: ArrayLike<number>, distance: number): Vec3 => [
  rotation[2] * distance,
  rotation[6] * distance,
  rotation[10] * distance,
];

function project(matrix: ArrayLike<number>, p: Vec3): { x: number; y: number; w: number } {
  const at = (row: number) => matrix[row] * p[0] + matrix[4 + row] * p[1] + matrix[8 + row] * p[2] + matrix[12 + row];
  return { x: at(0) / at(3), y: at(1) / at(3), w: at(3) };
}

describe("cameraFromMatrix", () => {
  it.each([
    ["plain", { ...DEFAULT_VIEW, bearing: 0, pitch: 0, roll: 0 }],
    ["bearing and pitch", { lng: 40, lat: -10, bearing: 35, pitch: 50, roll: 0 }],
  ])("recovers the camera (%s)", (_name, camera) => {
    const { matrix, view } = globeMatrix(WORLD_DISTANCE, camera);
    const found = cameraFromMatrix(matrix);
    const expected = expectedCamera(view, WORLD_DISTANCE);
    for (let i = 0; i < 3; i++) expect(found[i]).toBeCloseTo(expected[i], 4);
  });

  it("is unaffected by a padding offset in clip space", () => {
    const { matrix, view } = globeMatrix(WORLD_DISTANCE);
    const shift = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.3, -0.2, 0, 1];
    const found = cameraFromMatrix(multiply(shift, matrix));
    const expected = expectedCamera(view, WORLD_DISTANCE);
    for (let i = 0; i < 3; i++) expect(found[i]).toBeCloseTo(expected[i], 4);
  });
});

describe("moonBasis", () => {
  const center = moonCenter();
  const { right, up, toCamera } = moonBasis([0, 0, 4], center);

  it("is orthonormal and faces the camera", () => {
    for (const v of [right, up, toCamera]) expect(length(v)).toBeCloseTo(1, 6);
    expect(dot(right, up)).toBeCloseTo(0, 6);
    expect(dot(right, toCamera)).toBeCloseTo(0, 6);
    expect(dot(up, toCamera)).toBeCloseTo(0, 6);
    const toward = [-center[0] + 0, -center[1], 4 - center[2]];
    expect(dot(toCamera, toward as Vec3)).toBeCloseTo(length(toward as Vec3), 5);
  });

  it("survives a camera straight above the north axis", () => {
    const basis = moonBasis([0, 5, 0], [0, 60, 0]);
    expect(length(basis.right)).toBeCloseTo(1, 6);
  });
});

describe("moonInFront", () => {
  const center = moonCenter();
  it("is false from the default view and true once the camera is beyond the Moon", () => {
    expect(moonInFront(surfacePoint(DEFAULT_VIEW.lng, DEFAULT_VIEW.lat).map((v) => v * 4) as Vec3, center)).toBe(false);
    expect(moonInFront(center.map((v) => v * 1.5) as Vec3, center)).toBe(true);
  });
});

describe("placement and phase", () => {
  const center = moonCenter();

  it("sits at the true distance", () => {
    expect(length(center)).toBeCloseTo(MOON_DISTANCE, 6);
  });

  it("frames upper-right of the globe in the opening view, clear of the disc", () => {
    const { matrix } = globeMatrix(WORLD_DISTANCE);
    const { x, y, w } = project(matrix, center);
    expect(w).toBeGreaterThan(0);
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
    expect(Math.abs(x)).toBeLessThan(1);
    expect(Math.abs(y)).toBeLessThan(1);
    const globeRadiusNdc = Math.tan(Math.asin(1 / WORLD_DISTANCE)) / Math.tan(FOV / 2);
    expect(Math.hypot(x * ASPECT, y)).toBeGreaterThan(globeRadiusNdc);
  });

  it("is a few tens of pixels across in the world view", () => {
    const { matrix } = globeMatrix(WORLD_DISTANCE);
    const w = project(matrix, center).w;
    const radiusPx = ((MOON_RADIUS / w) * (1 / Math.tan(FOV / 2)) * 800) / 2;
    expect(radiusPx).toBeGreaterThan(10);
    expect(radiusPx).toBeLessThan(40);
  });

  it("is about 80 % lit from the default camera", () => {
    const frame = moonBodyFrame(center);
    const sun = sunDirection(frame);
    const toCamera = moonBasis([0, 0, 4], center).toCamera;
    expect((1 + dot(sun, toCamera)) / 2).toBeGreaterThan(0.75);
    expect((1 + dot(sun, toCamera)) / 2).toBeLessThan(0.9);
  });

  it("puts east longitudes on the viewer's right and keeps maria on the near side", () => {
    const frame = moonBodyFrame(center);
    const { right } = moonBasis([0, 0, 4], center);
    const crisium = MARIA[3];
    expect(dot(selenographicDirection(frame, crisium.lon, crisium.lat), right)).toBeGreaterThan(0.5);
    for (const { lon, lat } of MARIA) expect(dot(selenographicDirection(frame, lon, lat), frame.z)).toBeGreaterThan(0);
  });
});
