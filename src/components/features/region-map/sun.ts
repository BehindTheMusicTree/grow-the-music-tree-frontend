import { MOON_DISTANCE, MOON_RADIUS, surfacePoint, type Vec3 } from "./moon";

const DEG = Math.PI / 180;

/** Shared, mutable sky state: the layers read `sun` at render time, so a tick can move it without rebuilding them. */
export type Sky = { sun: Vec3 };

/**
 * Sub-solar point (where the Sun is at the zenith) at `date`, in degrees. Low-precision solar ephemeris
 * (Astronomical Almanac, ~0.01°): enough for a visible terminator.
 */
export function subsolarPoint(date: Date): { lng: number; lat: number } {
  const n = date.getTime() / 86400000 + 2440587.5 - 2451545;
  const meanLongitude = 280.46 + 0.9856474 * n;
  const anomaly = (357.528 + 0.9856003 * n) * DEG;
  const eclipticLongitude = (meanLongitude + 1.915 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly)) * DEG;
  const obliquity = (23.439 - 0.0000004 * n) * DEG;
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude));
  const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLongitude), Math.cos(eclipticLongitude));
  const gmst = 280.46061837 + 360.98564736629 * n;
  const lng = ((((rightAscension / DEG - gmst + 180) % 360) + 360) % 360) - 180;
  return { lng, lat: declination / DEG };
}

/** Unit direction of the Sun in the globe frame at `date`. Sunlight is parallel, so it is the same from Earth and the Moon. */
export function sunDirectionAt(date: Date): Vec3 {
  const { lng, lat } = subsolarPoint(date);
  return surfacePoint(lng, lat);
}

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
