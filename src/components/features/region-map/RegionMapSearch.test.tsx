import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { RegionGenreLexiconEntry } from "@behindthemusictree/app-kit/genre-tree";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema } from "@schemas/api/region-map";
import RegionMapSearch from "./RegionMapSearch";

const index = RegionMapIndexSchema.parse(fixture);
const regions = new Map(index.regions.map((region) => [region.id, region]));
const push = vi.fn();
const lexiconEnabled = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>()),
  useRegionGenreLexicon: (_getBaseUrl: unknown, enabled: boolean) => {
    lexiconEnabled(enabled);
    const entries = enabled
      ? [
          {
            wikidataId: "Q2",
            uuid: "uuid-q2",
            name: "Breton music",
            treeName: "regional",
            genrePlaylistUuid: null,
            isUmbrella: false,
            viewsCount: 3,
          } as unknown as RegionGenreLexiconEntry,
        ]
      : [];
    return { entries, isPending: !enabled, isError: false };
  },
}));

vi.mock("@behindthemusictree/app-kit-ui/genre-tree", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@behindthemusictree/app-kit-ui/genre-tree")>()),
  useGenreRemoteSearchGroup: () => ({ key: "other-genres", label: "Other genres", items: [] }),
  useArtistSearchGroup: () => undefined,
  useSongSearchGroup: () => undefined,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const setup = () => {
  const onPick = vi.fn();
  render(<RegionMapSearch index={index} regions={regions} onPick={onPick} />);
  return onPick;
};

describe("RegionMapSearch", () => {
  it("loads the lexicon only once the input is focused", () => {
    setup();
    expect(lexiconEnabled).toHaveBeenLastCalledWith(false);
    fireEvent.focus(screen.getByRole("combobox", { name: "Search the map" }));
    expect(lexiconEnabled).toHaveBeenLastCalledWith(true);
  });

  it("opens a picked place", () => {
    const onPick = setup();
    const input = screen.getByRole("combobox", { name: "Search the map" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "brittany" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: /Brittany/ }));
    expect(onPick).toHaveBeenCalledWith("Q12130", null);
  });

  it("opens a picked genre in the region that lists it", () => {
    const onPick = setup();
    const input = screen.getByRole("combobox", { name: "Search the map" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "breton" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: /Breton music/ }));
    expect(onPick).toHaveBeenCalledWith("Q12130", "uuid-q2");
  });
});
