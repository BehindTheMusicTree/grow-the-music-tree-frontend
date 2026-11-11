export type Vec3 = [number, number, number];

const DEG = Math.PI / 180;

/** Distance from Earth's centre, in Earth radii (the real ratio is ~60). */
export const MOON_DISTANCE = 60;
/** Real radius is ~0.27 Earth radii; tripled so the Moon reads as more than a dot from the world view. */
export const MOON_RADIUS = 0.82;

/**
 * Where the opening world view looks (the WORLD_BOUNDS fit: lng 0, the mercator midpoint of -58..84, ~44°N).
 * The Moon is framed relative to it, so changing the opening bounds means revisiting this.
 */
export const DEFAULT_VIEW = { lng: 0, lat: 44 };
/** Angle of the Moon off the axis opposite the view centre, and its heading (45° = toward north-east). */
const MOON_OFFSET_ANGLE = 17 * DEG;
const MOON_OFFSET_HEADING = 45 * DEG;
/** Sun–Moon–Earth angle seen from the Moon: 50° is ~82 % lit, gibbous. */
const PHASE_ANGLE = 50 * DEG;

/** Near-side maria as selenographic (east longitude, latitude, angular radius), in degrees. */
export const MARIA: ReadonlyArray<{ lon: number; lat: number; radius: number }> = [
  { lon: -16, lat: 35, radius: 16 }, // Imbrium
  { lon: 18, lat: 28, radius: 9 }, // Serenitatis
  { lon: 31, lat: 9, radius: 10 }, // Tranquillitatis
  { lon: 59, lat: 17, radius: 5 }, // Crisium
  { lon: 51, lat: -4, radius: 8 }, // Fecunditatis
  { lon: -15, lat: -21, radius: 8 }, // Nubium
  { lon: -50, lat: 15, radius: 20 }, // Procellarum
  { lon: 34, lat: -15, radius: 4.5 }, // Nectaris
];

const NORTH: Vec3 = [0, 1, 0];

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const length = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
const normalize = (a: Vec3): Vec3 => scale(a, 1 / length(a));

/** Point on the unit globe, in the frame MapLibre's globe matrix expects (north = +Y, lng 0 / lat 0 = +Z). */
export function surfacePoint(lng: number, lat: number): Vec3 {
  return [Math.sin(lng * DEG) * Math.cos(lat * DEG), Math.sin(lat * DEG), Math.cos(lng * DEG) * Math.cos(lat * DEG)];
}

/** Moon centre in the globe frame: the antipode of the view centre, tilted toward its north-east tangent. */
export function moonCenter(view = DEFAULT_VIEW): Vec3 {
  const centre = surfacePoint(view.lng, view.lat);
  const lng = view.lng * DEG;
  const lat = view.lat * DEG;
  const east: Vec3 = [Math.cos(lng), 0, -Math.sin(lng)];
  const north: Vec3 = [-Math.sin(lat) * Math.sin(lng), Math.cos(lat), -Math.sin(lat) * Math.cos(lng)];
  const heading = add(scale(east, Math.cos(MOON_OFFSET_HEADING)), scale(north, Math.sin(MOON_OFFSET_HEADING)));
  const direction = normalize(
    add(scale(centre, -Math.cos(MOON_OFFSET_ANGLE)), scale(heading, Math.sin(MOON_OFFSET_ANGLE))),
  );
  return scale(direction, MOON_DISTANCE);
}

/**
 * Tidally locked body frame of the Moon: Z toward Earth, Y toward globe north, X to the viewer's right
 * (so east longitudes appear on the right, as in the sky).
 */
export function moonBodyFrame(center: Vec3): { x: Vec3; y: Vec3; z: Vec3 } {
  const z = normalize(scale(center, -1));
  const y = normalize(sub(NORTH, scale(z, dot(NORTH, z))));
  return { x: cross(y, z), y, z };
}

/** Unit direction, in the globe frame, of a selenographic longitude/latitude (degrees). */
export function selenographicDirection(frame: ReturnType<typeof moonBodyFrame>, lon: number, lat: number): Vec3 {
  const cosLat = Math.cos(lat * DEG);
  return add(
    add(scale(frame.x, Math.sin(lon * DEG) * cosLat), scale(frame.y, Math.sin(lat * DEG))),
    scale(frame.z, Math.cos(lon * DEG) * cosLat),
  );
}

/** Sun direction from the Moon: lit from the viewer's left, at the phase angle from the Earth direction. */
export function sunDirection(frame: ReturnType<typeof moonBodyFrame>): Vec3 {
  return add(scale(frame.z, Math.cos(PHASE_ANGLE)), scale(frame.x, -Math.sin(PHASE_ANGLE)));
}

/** Maria as world-frame `[x, y, z, cos(angular radius)]`, flattened for a `vec4[]` uniform. */
export function mariaUniform(frame: ReturnType<typeof moonBodyFrame>): Float32Array {
  const out = new Float32Array(MARIA.length * 4);
  MARIA.forEach(({ lon, lat, radius }, i) => {
    out.set([...selenographicDirection(frame, lon, lat), Math.cos(radius * DEG)], i * 4);
  });
  return out;
}

/**
 * Camera position in globe coordinates, from a column-major view-projection matrix: the camera is the one
 * point whose clip x, y and w are all zero, so rows 0, 1 and 3 give `A · camera = -column3`.
 */
export function cameraFromMatrix(m: ArrayLike<number>): Vec3 {
  const rows = [0, 1, 3];
  const a = rows.map((r) => [m[r], m[4 + r], m[8 + r]]);
  const b = rows.map((r) => -m[12 + r]);
  const det3 = (c0: number[], c1: number[], c2: number[]) =>
    c0[0] * (c1[1] * c2[2] - c1[2] * c2[1]) -
    c1[0] * (c0[1] * c2[2] - c0[2] * c2[1]) +
    c2[0] * (c0[1] * c1[2] - c0[2] * c1[1]);
  const col = (j: number) => a.map((row) => row[j]);
  const det = det3(col(0), col(1), col(2));
  if (Math.abs(det) < 1e-12) throw new Error("Moon: degenerate projection matrix");
  return [det3(b, col(1), col(2)) / det, det3(col(0), b, col(2)) / det, det3(col(0), col(1), b) / det];
}

/** Billboard basis facing the camera: `right`/`up` span the disc, `toCamera` is the surface normal at its centre. */
export function moonBasis(camera: Vec3, center: Vec3): { right: Vec3; up: Vec3; toCamera: Vec3 } {
  const toCamera = normalize(sub(camera, center));
  let right = cross(NORTH, toCamera);
  if (length(right) < 1e-6) right = [1, 0, 0];
  right = normalize(right);
  return { right, up: cross(toCamera, right), toCamera };
}

/** True when the camera is nearer to the Moon than Earth's centre is, so the Moon can lie in front of the globe. */
export function moonInFront(camera: Vec3, center: Vec3): boolean {
  return length(sub(camera, center)) < length(camera);
}
