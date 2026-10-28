import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { formatViewport, parseViewport, useGenreTreeUrlState } from "./useGenreTreeUrlState";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => "/",
  useSearchParams: () => searchParams,
}));

function renderState(genreIds?: ReadonlySet<string>) {
  return renderHook(() => useGenreTreeUrlState({ viewMode: "pop-core", genreIds }));
}

describe("useGenreTreeUrlState artist filter", () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
    searchParams = new URLSearchParams();
  });

  it("keeps ?artist= when a genre is selected", () => {
    searchParams = new URLSearchParams("artist=band&about=");
    const { result } = renderState();

    result.current.setSelectedNodeId("rock");

    expect(pushMock).toHaveBeenCalledWith("/?artist=band&genre=rock", { scroll: false });
  });

  it("drops the genre and about when an artist is set", () => {
    searchParams = new URLSearchParams("genre=rock&about=");
    const { result } = renderState();

    result.current.setArtistUuid("band");

    expect(pushMock).toHaveBeenCalledWith("/?artist=band", { scroll: false });
  });

  it("clears only the artist when the filter is cleared", () => {
    searchParams = new URLSearchParams("artist=band&genre=rock&zoom=pop");
    const { result } = renderState();

    result.current.setArtistUuid(null);

    expect(pushMock).toHaveBeenCalledWith("/?genre=rock&zoom=pop", { scroll: false });
  });

  it("drops a first-load genre outside the artist's tree but keeps the artist", () => {
    searchParams = new URLSearchParams("artist=band&genre=metal");
    renderState(new Set(["pop", "rock"]));

    expect(replaceMock).toHaveBeenCalledWith("/?artist=band", { scroll: false });
  });

  it("keeps a first-load genre inside the artist's tree", () => {
    searchParams = new URLSearchParams("artist=band&genre=rock");
    renderState(new Set(["pop", "rock"]));

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("replaces a rejected zoom rather than pushing history", () => {
    searchParams = new URLSearchParams("artist=band&zoom=metal");
    const { result } = renderState();

    result.current.setFocus(null, "rejected");

    expect(replaceMock).toHaveBeenCalledWith("/?artist=band", { scroll: false });
    expect(pushMock).not.toHaveBeenCalled();
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
