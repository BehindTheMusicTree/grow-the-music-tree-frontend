import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { GenreSearchResult, RegionGenreLexiconEntry } from "@behindthemusictree/app-kit/genre-tree";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type Region } from "@schemas/api/region-map";
import RegionMapSearch from "./RegionMapSearch";

const index = RegionMapIndexSchema.parse(fixture);
const regions = new Map(index.regions.map((region) => [region.id, region]));
const lexiconEnabled = vi.fn();
const selectedGenre = { uuid: "8f14e45f-ceea-467f-a1d3-2e6f7c1b9a10", name: "Breton punk" };
const brittany = index.regions.find((region) => region.id === "Q12130") as Region;
let overviewLookup: { data: { uuid: string; name: string } | null | undefined; isError: boolean } = {
  data: undefined,
  isError: false,
};
const remoteGenre = {
  uuid: "f2234c80-5949-4ee5-90f5-cd689bd0c693", name: "Breton rock", treeName: "regional",
  genrePlaylistUuid: null, wikidataId: "Q47005557", isUmbrella: false,
} as GenreSearchResult;

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>()),
  useArtist: (uuid: string | null) =>
    uuid === "artist-1" ? { status: "success", artist: { name: "Kassav" } } : { status: "idle" },
  useSong: (uuid: string | null) =>
    uuid === "song-1" ? { status: "success", song: { title: "Zouk la se sel medikaman" } } : { status: "idle" },
  useFetchGenreDetail: (uuid: string | null) => (uuid === selectedGenre.uuid ? { status: "success", genre: selectedGenre } : { status: uuid === null ? "idle" : "not-found" }),
  useGenreByWikidataId: (wikidataId: string | null) =>
    wikidataId === null ? { data: undefined, isError: false } : overviewLookup,
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
  useGenreRemoteSearchGroup: (
    _base: unknown, query: string, onSelect: (genre: GenreSearchResult) => void,
    options: { enabled: boolean; filter: (genre: GenreSearchResult) => boolean },
  ) => ({ key: "other-genres", label: "Other genres", items:
    options.enabled && query.toLowerCase().includes("rock") && options.filter(remoteGenre)
      ? [{ key: remoteGenre.uuid, content: remoteGenre.name, onSelect: () => onSelect(remoteGenre) }]
      : [],
  }),
  useArtistSearchGroup: (_base: unknown, query: string, onSelect: (artist: { uuid: string }) => void) =>
    query === "kassav"
      ? { key: "artists", label: "Artists", items: [{ key: "a", content: "Kassav", onSelect: () => onSelect({ uuid: "artist-1" }) }] }
      : undefined,
  useSongSearchGroup: (_base: unknown, query: string, onSelect: (song: { uuid: string }) => void) =>
    query === "zouk"
      ? { key: "songs", label: "Songs", items: [{ key: "s", content: "Zouk la", onSelect: () => onSelect({ uuid: "song-1" }) }] }
      : undefined,
}));

afterEach(() => {
  cleanup();
  overviewLookup = { data: undefined, isError: false };
  vi.clearAllMocks();
});

const setup = () => {
  const onPick = vi.fn();
  const onPickArtist = vi.fn();
  const onPickSong = vi.fn();
  render(
    <RegionMapSearch
      index={index} regions={regions} onPick={onPick} onPickArtist={onPickArtist} onPickSong={onPickSong}
      selectedRegion={undefined} selectedGenreUuid={null} selectedArtistUuid={null} selectedSongUuid={null}
      onClosePanel={vi.fn()}
    />,
  );
  return Object.assign(onPick, { onPickArtist, onPickSong });
};

const setupSelected = (selection: { region?: Region; genre?: string; artist?: string; song?: string }) => {
  const onClosePanel = vi.fn();
  const element = (region = selection.region, genre = selection.genre ?? null) => (
    <RegionMapSearch
      index={index} regions={regions} onPick={vi.fn()} onPickArtist={vi.fn()} onPickSong={vi.fn()}
      selectedRegion={region} selectedGenreUuid={genre}
      selectedArtistUuid={selection.artist ?? null} selectedSongUuid={selection.song ?? null}
      onClosePanel={onClosePanel}
    />
  );
  const { rerender } = render(element());
  return { onClosePanel, closeSelection: () => rerender(element(undefined, null)) };
};

const withOverview = (id: string | null): Region => ({ ...brittany, overviewItemId: id, inheritedOverviewItemId: null });
const searchInput = () => screen.getByRole("combobox", { name: "Search the map" });
const closeButton = () => screen.queryByRole("button", { name: "Close panel" });

describe("RegionMapSearch", () => {
  it.each(["click", "keyboard"])("opens a remote descendant without a playlist or map entry by %s", (method) => {
    const onPick = setup();
    const input = screen.getByRole("combobox", { name: "Search the map" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Breton rock" } });
    if (method === "click") {
      fireEvent.mouseDown(screen.getByRole("option", { name: "Breton rock" }));
    } else {
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });
    }
    expect(onPick).toHaveBeenCalledWith(null, remoteGenre.uuid);
  });

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

  it.each([
    ["artist", "kassav", "Kassav", "onPickArtist", "artist-1"],
    ["song", "zouk", "Zouk la", "onPickSong", "song-1"],
  ] as const)("opens a picked %s through the map", (_kind, text, option, callback, uuid) => {
    const onPick = setup();
    fireEvent.focus(searchInput());
    fireEvent.change(searchInput(), { target: { value: text } });
    fireEvent.mouseDown(screen.getByRole("option", { name: option }));
    expect(onPick[callback]).toHaveBeenCalledWith(uuid);
    expect(onPick).not.toHaveBeenCalled();
  });

  it("shows the open artist or song by its name and offers to close it", () => {
    setupSelected({ artist: "artist-1" });
    expect(searchInput()).toHaveProperty("value", "Kassav");
    expect(closeButton()).not.toBeNull();
    cleanup();
    setupSelected({ artist: "artist-1", song: "song-1" });
    expect(searchInput()).toHaveProperty("value", "Zouk la se sel medikaman");
  });

  it("offers no close button with nothing selected, even with typed text", () => {
    setup();
    fireEvent.change(searchInput(), { target: { value: "brittany" } });
    expect(closeButton()).toBeNull();
  });

  it("shows a region without an overview by its own name", () => {
    setupSelected({ region: withOverview(null) });
    expect(searchInput()).toHaveProperty("value", brittany.name);
  });

  it("waits for the overview genre before naming a region", () => {
    setupSelected({ region: withOverview("Q1") });
    expect(searchInput()).toHaveProperty("value", "");
    expect(closeButton()).not.toBeNull();
  });

  it("shows the overview genre's name for a region that has one", () => {
    overviewLookup = { data: { uuid: "uuid-overview", name: "Music of Brittany" }, isError: false };
    setupSelected({ region: withOverview("Q1") });
    expect(searchInput()).toHaveProperty("value", "Music of Brittany");
  });

  it("falls back to the region's name when its overview fails", () => {
    overviewLookup = { data: undefined, isError: true };
    setupSelected({ region: withOverview("Q1") });
    expect(searchInput()).toHaveProperty("value", brittany.name);
  });

  it("names the selected genre rather than its region", () => {
    setupSelected({ region: withOverview(null), genre: selectedGenre.uuid });
    expect(searchInput()).toHaveProperty("value", selectedGenre.name);
  });

  it("closes the panel and empties the box from the close button", () => {
    const { onClosePanel, closeSelection } = setupSelected({ genre: selectedGenre.uuid });
    fireEvent.click(closeButton() as HTMLElement);
    expect(onClosePanel).toHaveBeenCalledTimes(1);
    closeSelection();
    expect(searchInput()).toHaveProperty("value", "");
    expect(closeButton()).toBeNull();
  });

  it("restores the selected name after picking the item already shown", () => {
    setupSelected({ region: withOverview(null) });
    fireEvent.focus(searchInput());
    fireEvent.change(searchInput(), { target: { value: "brittany" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: /Brittany/ }));
    expect(searchInput()).toHaveProperty("value", brittany.name);
  });
});
