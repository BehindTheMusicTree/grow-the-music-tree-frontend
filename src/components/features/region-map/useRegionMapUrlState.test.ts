import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRegionMapUrlState } from "./useRegionMapUrlState";

let search = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => search,
}));

const flushNavigation = () => act(async () => {});

describe("useRegionMapUrlState", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/map?path=Q142");
    search = new URLSearchParams("path=Q142");
  });

  it("reads the path, region and genre from the query string", () => {
    search = new URLSearchParams("path=Q142/Q12130&region=Q12130&genre=g1");

    expect(renderHook(() => useRegionMapUrlState()).result.current.state).toEqual({
      path: ["Q142", "Q12130"],
      region: "Q12130",
      genre: "g1",
    });
  });

  // Regression: an update built on the rendered params dropped an earlier update not yet rendered.
  it("keeps an update not yet rendered when another one follows", async () => {
    const { update } = renderHook(() => useRegionMapUrlState()).result.current;

    update({ region: "Q142" });
    await flushNavigation();
    update({ genre: "g1" });
    await flushNavigation();

    const params = new URLSearchParams(window.location.search);
    expect(params.get("path")).toBe("Q142");
    expect(params.get("region")).toBe("Q142");
    expect(params.get("genre")).toBe("g1");
  });
});
