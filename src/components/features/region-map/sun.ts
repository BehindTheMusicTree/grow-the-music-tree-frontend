import { MOON_DISTANCE, MOON_RADIUS, moonBodyFrame, moonCenter, sunDirection, type Vec3 } from "./moon";

const DEG = Math.PI / 180;

/**
 * Unit direction of the Sun in the globe frame: the one the Moon's gibbous lighting implies. Sunlight rays are
 * parallel, so the direction seen from the Moon is also the one seen from Earth. It drives the Sun disc, the
 * Moon's shading and the atmosphere light, so they cannot drift apart.
 */
export const SUN_DIRECTION: Vec3 = sunDirection(moonBodyFrame(moonCenter()));

/** Same apparent size as the Moon, as in reality. */
export const SUN_ANGULAR_RADIUS = Math.asin(MOON_RADIUS / MOON_DISTANCE);
/** Extent of the halo quad, in disc radii. */
export const SUN_GLOW_SCALE = 6;

/**
 * MapLibre `light.position` (`[radius, azimuthal, polar]`, degrees) that puts a map-anchored sun along `dir`.
 * Inverts `getSunPos` (maplibre-gl `draw_sky.ts`): the globe-frame sun is `-sphericalToCartesian(position)`.
 */
export function sunLightPosition(dir: Vec3): [number, number, number] {
  const polar = Math.acos(-dir[2]) / DEG;
  const azimuthal = Math.atan2(dir[0], -dir[1]) / DEG;
  return [1, (azimuthal + 360) % 360, polar];
}
