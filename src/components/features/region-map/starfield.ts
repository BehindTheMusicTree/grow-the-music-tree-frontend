export const STAR_COUNT = 3000;
export const STAR_SEED = 0x57a7f1e1d;
/** Floats per star in the buffer: x, y, z (unit direction), size (CSS px), brightness. */
export const STAR_STRIDE = 5;

const MIN_SIZE = 1;
const MAX_SIZE = 2.5;
const BRIGHTNESS_EXPONENT = 3;
const DEG = Math.PI / 180;

export type OrbitCamera = {
  lng: number;
  lat: number;
  bearing: number;
  pitch: number;
  roll: number;
};

/** Seeded PRNG, so the sky is identical on every load. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stars uniform on the unit sphere, interleaved `[x, y, z, size, brightness]`; most are dim and small. */
export function generateStars(count: number, seed: number): Float32Array {
  const random = mulberry32(seed);
  const stars = new Float32Array(count * STAR_STRIDE);
  for (let i = 0; i < count; i++) {
    const z = random() * 2 - 1;
    const theta = random() * 2 * Math.PI;
    const ring = Math.sqrt(1 - z * z);
    const brightness = random() ** BRIGHTNESS_EXPONENT;
    const offset = i * STAR_STRIDE;
    stars[offset] = ring * Math.cos(theta);
    stars[offset + 1] = ring * Math.sin(theta);
    stars[offset + 2] = z;
    stars[offset + 3] = MIN_SIZE + (MAX_SIZE - MIN_SIZE) * brightness;
    stars[offset + 4] = 0.25 + 0.75 * brightness;
  }
  return stars;
}

// Row-major 4x4 helpers; `toColumnMajor` converts for WebGL at the end.
type Mat4 = number[];

const identity = (): Mat4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Array<number>(16).fill(0);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      for (let k = 0; k < 4; k++) out[row * 4 + col] += a[row * 4 + k] * b[k * 4 + col];
    }
  }
  return out;
}

const rotationX = (a: number): Mat4 => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1];
};
const rotationY = (a: number): Mat4 => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1];
};
const rotationZ = (a: number): Mat4 => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

const toColumnMajor = (m: Mat4): Float32Array => {
  const out = new Float32Array(16);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) out[col * 4 + row] = m[row * 4 + col];
  return out;
};

const fromColumnMajor = (m: Float32Array): Mat4 => {
  const out = new Array<number>(16);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) out[row * 4 + col] = m[col * 4 + row];
  return out;
};

/**
 * Globe-frame direction to view space, in the order MapLibre's `getSunPos` uses for a map-anchored light
 * (angles in degrees). The point under the map centre lands on +Z, toward the camera, which looks down -Z.
 */
export function orbitRotation({ lng, lat, bearing, pitch, roll }: OrbitCamera): Float32Array {
  let m = identity();
  m = multiply(m, rotationZ(roll * DEG));
  m = multiply(m, rotationX(-pitch * DEG));
  m = multiply(m, rotationZ(bearing * DEG));
  m = multiply(m, rotationX(lat * DEG));
  m = multiply(m, rotationY(-lng * DEG));
  return toColumnMajor(m);
}

/** Standard OpenGL perspective projection; `fovY` in radians. */
export function perspective(fovY: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fovY / 2);
  const range = near - far;
  return toColumnMajor([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / range,
    (2 * far * near) / range,
    0,
    0,
    -1,
    0,
  ]);
}

const NEAR = 0.1;
const FAR = 10;

/** Matrix for a sky at infinity: `perspective · orbitRotation`. The shader keeps only xyww, so near/far do not matter. */
export function starfieldMatrix(camera: OrbitCamera, fovY: number, aspect: number): Float32Array {
  return toColumnMajor(
    multiply(fromColumnMajor(perspective(fovY, aspect, NEAR, FAR)), fromColumnMajor(orbitRotation(camera))),
  );
}
