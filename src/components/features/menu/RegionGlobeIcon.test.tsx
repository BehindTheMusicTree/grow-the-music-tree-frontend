import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RegionGlobeIcon } from "./RegionGlobeIcon";
import { REGION_GLOBES, REGION_GLOBE_PATHS } from "./regionGlobePaths";

function mockReducedMotion(initial: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches: initial,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  };
  vi.spyOn(window, "matchMedia").mockReturnValue(query as unknown as MediaQueryList);
  return {
    listeners,
    set(matches: boolean) {
      query.matches = matches;
      act(() => listeners.forEach((listener) => listener()));
    },
  };
}

function currentGlobe() {
  return screen.getByTestId("region-globe-path").getAttribute("d");
}

function advance(ms: number) {
  act(() => void vi.advanceTimersByTime(ms));
}

describe("RegionGlobeIcon", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("cycles through the continents", () => {
    mockReducedMotion(false);
    render(<RegionGlobeIcon />);
    expect(currentGlobe()).toBe(REGION_GLOBE_PATHS[REGION_GLOBES[0]]);
    advance(3000);
    expect(currentGlobe()).toBe(REGION_GLOBE_PATHS[REGION_GLOBES[1]]);
    advance(6000);
    expect(currentGlobe()).toBe(REGION_GLOBE_PATHS[REGION_GLOBES[0]]);
  });

  it("stays still with prefers-reduced-motion", () => {
    mockReducedMotion(true);
    render(<RegionGlobeIcon />);
    advance(10000);
    expect(currentGlobe()).toBe(REGION_GLOBE_PATHS[REGION_GLOBES[0]]);
  });

  it("follows reduced-motion changes while mounted", () => {
    const motion = mockReducedMotion(false);
    render(<RegionGlobeIcon />);
    motion.set(true);
    advance(10000);
    expect(currentGlobe()).toBe(REGION_GLOBE_PATHS[REGION_GLOBES[0]]);
    motion.set(false);
    advance(3000);
    expect(currentGlobe()).toBe(REGION_GLOBE_PATHS[REGION_GLOBES[1]]);
  });

  it("stops rotating and unsubscribes on unmount", () => {
    const motion = mockReducedMotion(false);
    const { unmount } = render(<RegionGlobeIcon />);
    unmount();
    expect(motion.listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
