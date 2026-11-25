import { range, scaleLinear, type ScaleLinear } from "d3";

// Sticky breakpoints: the recorded past is sparse and the last centuries are dense, so each
// segment gets its own pixel height instead of one linear stretch.
export const YEAR_BREAKPOINTS = [-2000, 0, 1000, 1500, 1800, 1950] as const;
const SEGMENT_HEIGHTS = [200, 250, 300, 600, 1000] as const;
const SEGMENT_TICK_STEPS = [500, 250, 100, 50, 25] as const;

export const BASE_HEIGHT = SEGMENT_HEIGHTS.reduce((sum, height) => sum + height, 0);

/** `stretch` > 1 spreads the years over more pixels, to use spare viewport height without distorting marks. */
export function createYearScale(stretch = 1): ScaleLinear<number, number> {
  const offsets = SEGMENT_HEIGHTS.reduce<number[]>((acc, height) => [...acc, acc[acc.length - 1]! + height * stretch], [0]);
  return scaleLinear<number, number>().domain([...YEAR_BREAKPOINTS]).range(offsets).clamp(true);
}

export function yearTicks(): number[] {
  return [
    ...YEAR_BREAKPOINTS.slice(0, -1).flatMap((start, i) => range(start, YEAR_BREAKPOINTS[i + 1]!, SEGMENT_TICK_STEPS[i])),
    YEAR_BREAKPOINTS[YEAR_BREAKPOINTS.length - 1]!,
  ];
}

export const YEAR_MIN = YEAR_BREAKPOINTS[0];
export const YEAR_MAX = YEAR_BREAKPOINTS[YEAR_BREAKPOINTS.length - 1]!;
