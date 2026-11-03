import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RegionGlobeIcon } from "./RegionGlobeIcon";
import { REGION_GLOBES, REGION_GLOBE_PATHS } from "./regionGlobePaths";

function mockReducedMotion(matches: boolean) {
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches } as MediaQueryList);
}

function currentPath(container: HTMLElement) {
  return container.querySelector("path")?.getAttribute("d");
}

describe("RegionGlobeIcon", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("cycles through the continents", () => {
    mockReducedMotion(false);
    const { container } = render(<RegionGlobeIcon />);
    expect(currentPath(container)).toBe(REGION_GLOBE_PATHS[REGION_GLOBES[0]]);
    act(() => void vi.advanceTimersByTime(3000));
    expect(currentPath(container)).toBe(REGION_GLOBE_PATHS[REGION_GLOBES[1]]);
    act(() => void vi.advanceTimersByTime(6000));
    expect(currentPath(container)).toBe(REGION_GLOBE_PATHS[REGION_GLOBES[0]]);
  });

  it("stays still with prefers-reduced-motion", () => {
    mockReducedMotion(true);
    const { container } = render(<RegionGlobeIcon />);
    act(() => void vi.advanceTimersByTime(10000));
    expect(currentPath(container)).toBe(REGION_GLOBE_PATHS[REGION_GLOBES[0]]);
  });
});
