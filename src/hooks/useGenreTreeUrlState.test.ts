import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { formatViewport, parseViewport, useGenreTreeUrlState } from "./useGenreTreeUrlState";

let searchParams = new URLSearchParams();
const pushState = vi.spyOn(window.history, "pushState");
const replaceState = vi.spyOn(window.history, "replaceState");
// URL writes start from window.location, so the rendered params must match it.
const setSearch = (query: string) => {
  Object.getPrototypeOf(window.history).replaceState.call(window.history, null, "", query ? `/?${query}` : "/");
  searchParams = new URLSearchParams(query);
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => searchParams,
}));

function renderState(genreIds?: ReadonlySet<string>) {
  return renderHook(() => useGenreTreeUrlState({ viewMode: "pop-core", genreIds }));
}

// URL writes are batched in a microtask; this lets the batch flush.
const flushNavigation = () => act(async () => {});

describe("useGenreTreeUrlState artist filter", () => {
  beforeEach(() => {
    pushState.mockClear();
    replaceState.mockClear();
    setSearch("");
  });

  it("keeps ?artist= when a genre is selected", async () => {
    setSearch("artist=band&about=");
    const { result } = renderState();

    result.current.setSelectedNodeId("rock");

    await flushNavigation();

    expect(pushState).toHaveBeenCalledWith(null, "", "/?artist=band&genre=rock");
  });

  it("drops the genre and about when an artist is set", async () => {
    setSearch("genre=rock&about=");
    const { result } = renderState();

    result.current.setArtistUuid("band");

    await flushNavigation();

    expect(pushState).toHaveBeenCalledWith(null, "", "/?artist=band");
  });

  it("drops the genre, artist and about when a song is set", async () => {
    setSearch("artist=band&genre=rock&about=");
    const { result } = renderState();

    result.current.setSongUuid("song-1");

    await flushNavigation();

    expect(pushState).toHaveBeenCalledWith(null, "", "/?song=song-1");
  });

  it("drops the song when a genre or an artist is set", async () => {
    setSearch("song=song-1");
    const { result } = renderState();

    result.current.setSelectedNodeId("rock");
    await flushNavigation();
    expect(pushState).toHaveBeenLastCalledWith(null, "", "/?genre=rock");

    result.current.setArtistUuid("band");
    await flushNavigation();
    expect(pushState).toHaveBeenLastCalledWith(null, "", "/?artist=band");
  });

  it("clears only the artist when the filter is cleared", async () => {
    setSearch("artist=band&genre=rock&zoom=pop");
    const { result } = renderState();

    result.current.setArtistUuid(null);

    await flushNavigation();

    expect(pushState).toHaveBeenCalledWith(null, "", "/?genre=rock&zoom=pop");
  });

  it("drops a first-load genre outside the artist's tree but keeps the artist", async () => {
    setSearch("artist=band&genre=metal");
    renderState(new Set(["pop", "rock"]));

    await flushNavigation();

    expect(replaceState).toHaveBeenCalledWith(null, "", "/?artist=band");
  });

  it("keeps a first-load genre inside the artist's tree", async () => {
    setSearch("artist=band&genre=rock");
    renderState(new Set(["pop", "rock"]));

    await flushNavigation();

    expect(replaceState).not.toHaveBeenCalled();
  });

  it("pushes one history entry when the selection is cleared before an artist is set", async () => {
    setSearch("genre=rock");
    const { result } = renderState();

    result.current.setSelectedNodeId(null);
    result.current.setArtistUuid("band");

    await flushNavigation();

    expect(pushState).toHaveBeenCalledTimes(1);
    expect(pushState).toHaveBeenCalledWith(null, "", "/?artist=band");
  });

  it("replaces a rejected zoom rather than pushing history", async () => {
    setSearch("artist=band&zoom=metal");
    const { result } = renderState();

    result.current.setFocus(null, "rejected");

    await flushNavigation();

    expect(replaceState).toHaveBeenCalledWith(null, "", "/?artist=band");
    expect(pushState).not.toHaveBeenCalled();
  });
});

describe("parseViewport", () => {
  it("parses x,y,zoom", () => {
    expect(parseViewport("12.5,-3,0.75")).toEqual({ x: 12.5, y: -3, zoom: 0.75 });
  });

  it.each([null, "", "1,2", "1,2,3,4", "a,b,c", "1,2,0", "1,2,-1", "1,Infinity,1"])("rejects %j", (raw) => {
    expect(parseViewport(raw)).toBeUndefined();
  });
});

describe("formatViewport", () => {
  it("rounds x and y to one decimal and zoom to two", () => {
    expect(formatViewport({ x: 10.04, y: -20, zoom: 0.5 })).toBe("10.0,-20.0,0.50");
  });
});

describe("useGenreTreeUrlState size metric", () => {
  beforeEach(() => {
    pushState.mockClear();
    replaceState.mockClear();
    setSearch("");
  });

  it("defaults to songs and reads ?size=views", () => {
    expect(renderState().result.current.sizeMetric).toBe("songs");
    setSearch("size=views");
    expect(renderState().result.current.sizeMetric).toBe("views");
  });

  it("falls back to songs on an unknown ?size= value", () => {
    setSearch("size=bogus");
    expect(renderState().result.current.sizeMetric).toBe("songs");
  });

  it("writes ?size=views and drops it for songs, keeping other params", async () => {
    setSearch("genre=rock");
    const { result } = renderState();

    result.current.setSizeMetric("views");
    await flushNavigation();
    expect(replaceState).toHaveBeenCalledWith(null, "", "/?genre=rock&size=views");

    setSearch("genre=rock&size=views");
    const second = renderState();
    second.result.current.setSizeMetric("songs");
    await flushNavigation();
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/?genre=rock");
  });
});

describe("useGenreTreeUrlState writes not yet rendered", () => {
  beforeEach(() => {
    pushState.mockClear();
    replaceState.mockClear();
    setSearch("view=1.0,2.0,0.50");
  });

  // Regression: the tree reports the end of the zoom a selection triggers through the callbacks of the render
  // before the selection, whose params lacked ?genre=; writing from those params closed the panel just opened.
  it("keeps a just-selected genre when the viewport is reported before the next render", async () => {
    const { result } = renderState();
    const { setSelectedNodeId, onViewportChange } = result.current;

    setSelectedNodeId("pop");
    await flushNavigation();
    onViewportChange({ x: 3, y: 4, zoom: 0.2 });
    await flushNavigation();

    const params = new URLSearchParams(window.location.search);
    expect(params.get("genre")).toBe("pop");
    expect(params.get("view")).toBe("3.0,4.0,0.20");
  });
});
