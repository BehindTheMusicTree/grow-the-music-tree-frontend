import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { parseCamera, serializeCamera, useRegionMapUrlState } from "./useRegionMapUrlState";

let search = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/map",
  useSearchParams: () => search,
}));

const flushNavigation = () => act(async () => {});

describe("useRegionMapUrlState", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/map?at=2,46,5");
    search = new URLSearchParams("at=2,46,5");
  });

  it("reads the camera, region, genre and a legacy drill path from the query string", () => {
    search = new URLSearchParams("at=2.5,46.1,5.25&path=Q142/Q12130&region=Q12130&genre=g1");

    expect(renderHook(() => useRegionMapUrlState()).result.current.state).toEqual({
      at: { lng: 2.5, lat: 46.1, zoom: 5.25 },
      region: "Q12130",
      genre: "g1",
      artist: null,
      song: null,
      legacyPath: ["Q142", "Q12130"],
    });
  });

  it("reads the open artist and song", () => {
    search = new URLSearchParams("artist=a1&song=s1");

    const { state } = renderHook(() => useRegionMapUrlState()).result.current;
    expect([state.artist, state.song]).toEqual(["a1", "s1"]);
  });

  it.each([
    ["region", { region: "Q142" }, "genre=g1&artist=a1&song=s1", { genre: "g1", artist: null, song: null }],
    ["genre", { genre: "g2" }, "region=Q1&artist=a1&song=s1", { region: "Q1", artist: "a1", song: null }],
    ["artist", { artist: "a2" }, "region=Q1&genre=g1&song=s1", { region: "Q1", genre: null, song: null }],
    ["song", { song: "s2" }, "region=Q1&genre=g1&artist=a1", { region: "Q1", genre: null, artist: null }],
  ] as const)("choosing a %s drops the entities it outranks", async (_kind, change, query, expected) => {
    window.history.replaceState(null, "", `/map?${query}`);
    const { update } = renderHook(() => useRegionMapUrlState()).result.current;

    update(change);
    await flushNavigation();

    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(expected)) expect(params.get(key)).toBe(value);
  });

  it("clears every panel entity at once", async () => {
    window.history.replaceState(null, "", "/map?region=Q1&genre=g1&artist=a1&song=s1&at=2,46,5");
    const { update } = renderHook(() => useRegionMapUrlState()).result.current;

    update({ region: null, genre: null, artist: null, song: null });
    await flushNavigation();

    expect(window.location.search).toBe("?at=2%2C46%2C5");
  });

  it("does not write the camera once the location has left the map", async () => {
    const { update } = renderHook(() => useRegionMapUrlState()).result.current;

    update({ at: { lng: 1, lat: 2, zoom: 3 } }, "replace");
    window.history.pushState(null, "", "/?artist=a1");
    await flushNavigation();

    expect(window.location.search).toBe("?artist=a1");
  });

  it("writes the camera rounded and removes the legacy path", async () => {
    window.history.replaceState(null, "", "/map?path=Q142");
    const { update } = renderHook(() => useRegionMapUrlState()).result.current;

    update({ at: { lng: 2.123456, lat: -46.987654, zoom: 5.4321 }, legacyPath: null }, "replace");
    await flushNavigation();

    const params = new URLSearchParams(window.location.search);
    expect(params.get("at")).toBe("2.1235,-46.9877,5.43");
    expect(params.has("path")).toBe(false);
  });

  // Regression: an update built on the rendered params dropped an earlier update not yet rendered.
  it("keeps an update not yet rendered when another one follows", async () => {
    const { update } = renderHook(() => useRegionMapUrlState()).result.current;

    update({ region: "Q142" });
    await flushNavigation();
    update({ genre: "g1" });
    await flushNavigation();

    const params = new URLSearchParams(window.location.search);
    expect(params.get("at")).toBe("2,46,5");
    expect(params.get("region")).toBe("Q142");
    expect(params.get("genre")).toBe("g1");
  });
});

describe("parseCamera", () => {
  it("reads lng,lat,zoom", () => {
    expect(parseCamera("-3.5,48,7.25")).toEqual({ lng: -3.5, lat: 48, zoom: 7.25 });
  });

  it.each([null, "", "2,46", "2,46,5,1", "2,,5", "a,46,5", "181,46,5", "2,91,5", "2,46,-1", "2,46,25", "Infinity,0,1"])(
    "rejects %j",
    (raw) => {
      expect(parseCamera(raw)).toBeNull();
    },
  );

  it("round-trips through serializeCamera", () => {
    const camera = { lng: 2.1235, lat: 46.9877, zoom: 5.43 };

    expect(parseCamera(serializeCamera(camera))).toEqual(camera);
  });
});
