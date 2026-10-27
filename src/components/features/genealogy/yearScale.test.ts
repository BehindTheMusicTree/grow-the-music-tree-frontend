import { describe, it, expect } from "vitest";
import { createYearScale, yearTicks, YEAR_BREAKPOINTS } from "./yearScale";

describe("createYearScale", () => {
  const scale = createYearScale();

  it("starts at zero and gives each segment its own height", () => {
    expect(scale(-2000)).toBe(0);
    expect(scale(0)).toBe(200);
    expect(scale(1000)).toBe(450);
    expect(scale(1950)).toBe(2350);
  });

  it("is linear inside a segment", () => {
    expect(scale(500)).toBe(325);
    expect(scale(1875)).toBe(1850);
  });

  it("stretches the recent segments more than the old ones", () => {
    const perYear = (from: number, to: number) => (scale(to) - scale(from)) / (to - from);

    expect(perYear(1800, 1950)).toBeGreaterThan(perYear(1500, 1800));
    expect(perYear(1500, 1800)).toBeGreaterThan(perYear(-2000, 0));
  });

  it("clamps years outside the domain", () => {
    expect(scale(-5000)).toBe(0);
    expect(scale(2100)).toBe(2350);
  });
});

describe("yearTicks", () => {
  it("covers every breakpoint in order", () => {
    const ticks = yearTicks();

    expect(ticks).toEqual([...ticks].sort((a, b) => a - b));
    for (const breakpoint of YEAR_BREAKPOINTS) expect(ticks).toContain(breakpoint);
  });
});
