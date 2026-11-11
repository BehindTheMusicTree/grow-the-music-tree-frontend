import { describe, it, expect, vi, afterEach } from "vitest";
import { useEffect, useState } from "react";
import { act, render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { makeGenreUuid } from "@behindthemusictree/app-kit/genre-tree/testing";
import type { GenreUuid } from "@behindthemusictree/app-kit/genre-tree";
import type { GenreTreeViewProps } from "@behindthemusictree/app-kit-ui/genre-tree";
import GenreTreePage from "./GenreTreePage";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

// URL writes are batched into a microtask, so history assertions run after it.
const flushNavigation = () => act(async () => {});

let searchParams = new URLSearchParams();
const pushState = vi.spyOn(window.history, "pushState");
const replaceState = vi.spyOn(window.history, "replaceState");
// URL writes start from window.location, so the rendered params must match it.
const setSearch = (query: string) => {
  Object.getPrototypeOf(window.history).replaceState.call(window.history, null, "", query ? `/?${query}` : "/");
  searchParams = new URLSearchParams(query);
};
let tracklistExpanded = false;
const setTracklistExpandedMock = vi.fn();

vi.mock("@contexts/PlayerPanelProvider", () => ({
  usePlayerPanel: () => ({
    isVisible: false,
    dismiss: vi.fn(),
    isExpanded: tracklistExpanded,
    setExpanded: setTracklistExpandedMock,
  }),
}));
const routerPushMock = vi.fn();
const regionMapIndexMock = vi.fn<(enabled?: boolean) => unknown>(() => ({ data: undefined, isPending: false, isError: false }));
const lexiconMock = vi.fn<(enabled: boolean) => unknown>(() => ({ entries: [], isPending: false, isError: false }));

vi.mock("@hooks/useRegionMap", () => ({ useRegionMapIndex: (enabled?: boolean) => regionMapIndexMock(enabled) }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock, replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => searchParams,
}));

const updateGenreParentMutateMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock("@hooks/curation/useUpdateGenreParent", () => ({
  useUpdateGenreParent: () => ({ mutate: updateGenreParentMutateMock }),
}));
vi.mock("sonner", () => ({ toast: { success: (...args: unknown[]) => toastSuccessMock(...args) } }));

const useIsAdminMock = vi.fn(() => false);

vi.mock("@hooks/useIsAdmin", () => ({
  useIsAdmin: () => useIsAdminMock(),
}));

const useVisibleGenrePlaylistsMock = vi.fn<
  (options: { artistUuid?: string | null }) => { genrePlaylists: unknown[]; isLoading: boolean }
>(() => ({ genrePlaylists: [], isLoading: false }));

vi.mock("@lib/site-urls", () => ({
  getGrowBackendBaseUrl: () => "/api/grow-proxy",
}));

vi.mock("@behindthemusictree/app-kit/popup", () => ({
  usePopup: () => ({ showPopup: vi.fn(), hidePopup: vi.fn() }),
}));

const hasMainstreamPopRootMock = vi.fn<(nodes: { id: string }[]) => boolean>(() => true);

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useVisibleGenrePlaylists: (options: { artistUuid?: string | null }) => useVisibleGenrePlaylistsMock(options),
  hasMainstreamPopRoot: (nodes: { id: string }[]) => hasMainstreamPopRootMock(nodes),
  useRegionGenreLexicon: (_getBaseUrl: () => string, enabled: boolean) => lexiconMock(enabled),
  SEARCH_QUERY_MIN_LENGTH: 2,
  rankByName: <T,>(items: T[], query: string, getName: (item: T) => string) =>
    items.filter((item) => getName(item).toLowerCase().includes(query.toLowerCase())),
  useArtist: () => ({ status: "idle" }),
  useSong: () => ({ status: "idle" }),
  GenrePlaylistUuidSchema: { parse: (value: string) => value },
}));

vi.mock("@behindthemusictree/app-kit-ui/genre-tree", async (importOriginal) => {
  const { SearchBox } = await importOriginal<typeof import("@behindthemusictree/app-kit-ui/genre-tree")>();
  return ({
  useGenreRemoteSearchGroup: (_base: unknown, query: string, select: (genre: { uuid: GenreUuid }) => void, options: { key?: string; label?: string }) => ({
    key: options.key ?? "genres", label: options.label, items: query ? [{ key: "g-regional", content: "Fra regional", onSelect: () => select({ uuid: makeGenreUuid("regional") }) }] : [],
  }),
  GenreTreeView: (props: GenreTreeViewProps) => {
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);
    const Groups = props.SearchGroups;
    return (
    <div
      data-testid="genre-tree-view"
      data-readonly={String(props.readOnly)}
      data-viewmode={props.viewMode}
      data-focus={props.focusGenreUuid === undefined ? "absent" : String(props.focusGenreUuid)}
    >
      {props.getBackendBaseUrl()}
      <span data-testid="artist-filter">{String(props.artistUuid ?? "none")}</span>
      <span data-testid="artist-expanded">{String(props.artistExpanded)}</span>
      <span data-testid="selected-node">{String(props.selectedGenreUuid ?? "none")}</span>
      <span data-testid="default-viewport">{JSON.stringify(props.defaultViewport ?? null)}</span>
      <button onClick={() => props.onViewportChange?.({ x: 10.04, y: -20, zoom: 0.5 })}>Pan</button>
      <button onClick={() => props.onSelectedGenreUuidChange?.(makeGenreUuid("rock"))}>Select genre</button>
      <button
        onClick={() => {
          if (props.selectedGenreUuid) props.onSelectedGenreUuidChange?.(null);
          props.onArtistUuidChange?.("band");
        }}
      >
        Pick artist
      </button>
      <button onClick={() => props.onArtistUuidChange?.(null)}>Clear artist</button>
      {props.onParentChanged && (
        <>
          <button
            onClick={() =>
              props.onParentChanged?.({
                genre: "criteria-dance-pop" as GenreUuid,
                from: "criteria-pop" as GenreUuid,
                to: "criteria-core" as GenreUuid,
              })
            }
          >
            Change parent
          </button>
          <button
            onClick={() =>
              props.onParentChanged?.({
                genre: "criteria-pop" as GenreUuid,
                from: null,
                to: "criteria-core" as GenreUuid,
              })
            }
          >
            Change root parent
          </button>
        </>
      )}
      <button onClick={() => props.onArtistExpandedChange?.(true)}>Expand artist</button>
      <button onClick={() => setFocused(true)}>Focus search</button>
      <button onClick={() => setQuery("fra")}>Type fra</button>
      {Groups && <Groups query={query} focused={focused} onSelectGenre={(uuid) => props.onSelectedGenreUuidChange?.(uuid)}>{(groups) => (
        <SearchBox label="Test genre search" value={query} onValueChange={setQuery}
          groups={[{ key: "genres", items: [] }, ...groups]} />
      )}</Groups>}
      {props.overlayPanel && (
        <section aria-label={String(props.overlayPanel.title)}>
          {props.overlayPanel.content}
          <button onClick={props.overlayPanel.onClose}>Close panel</button>
          {props.overlayPanel.onExpandedChange && (
            <button onClick={() => props.overlayPanel?.onExpandedChange?.(true)}>Expand panel</button>
          )}
        </section>
      )}
      {props.onFocusGenreChange && (
        <>
          <button onClick={() => props.onFocusGenreChange?.("rock", "zoom-in")}>Zoom in</button>
          <button onClick={() => props.onFocusGenreChange?.(null, "back")}>All genres</button>
          <button onClick={() => props.onFocusGenreChange?.(null, "rejected")}>Reject zoom</button>
        </>
      )}
    </div>
  );
  },
  searchStatus: () => undefined,
  GenreTreeViewSkeleton: ({ viewMode }: { viewMode: string }) => (
    <div data-testid="genre-tree-view-skeleton" data-viewmode={viewMode} />
  ),
});
});

function ForceWheelViewMode() {
  const { setViewMode } = useGenreTreeViewMode();
  useEffect(() => {
    setViewMode("wheel");
  }, [setViewMode]);
  return null;
}

/** Forces the provider's view mode to "pop-core" on mount, mirroring what clicking the
 * "Pop/Core" toggle in AppSubheader does, without needing to render AppSubheader itself. */
function ForcePopCoreViewMode() {
  const { setViewMode } = useGenreTreeViewMode();
  useEffect(() => {
    setViewMode("pop-core");
  }, [setViewMode]);
  return null;
}

function renderGenreTreePage({ forcePopCore = false }: { forcePopCore?: boolean } = {}) {
  return render(
    <GenreTreeViewModeProvider>
      {forcePopCore && <ForcePopCoreViewMode />}
      <GenreTreePage />
    </GenreTreeViewModeProvider>,
  );
}

describe("GenreTreePage", () => {
  afterEach(() => {
    cleanup();
    toastSuccessMock.mockReset();
    updateGenreParentMutateMock.mockReset();
    useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: [], isLoading: false });
    hasMainstreamPopRootMock.mockReturnValue(true);
    useIsAdminMock.mockReturnValue(false);
    setSearch("");
    pushState.mockClear();
    replaceState.mockClear();
    tracklistExpanded = false;
    setTracklistExpandedMock.mockReset();
    routerPushMock.mockReset();
    regionMapIndexMock.mockClear();
    lexiconMock.mockClear();
  });

  it("loads the place index on focus and does not use the map lexicon for genre discovery", async () => {
    renderGenreTreePage();
    await screen.findByTestId("genre-tree-view");
    expect(regionMapIndexMock).toHaveBeenLastCalledWith(false);
    expect(lexiconMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Focus search" }));

    await waitFor(() => expect(regionMapIndexMock).toHaveBeenLastCalledWith(true));
    expect(lexiconMock).not.toHaveBeenCalled();
  });

  it("opens regional search results in the tree and places on the map", async () => {
    regionMapIndexMock.mockReturnValue({
      data: {
        regions: [{ id: "Q142", name: "France", kind: "country", parentId: null, overviewItemId: null, genres: [{ itemId: "Q1", relation: "regional" }, { itemId: "Q2", relation: "canonical" }] }],
      },
      isPending: false,
      isError: false,
    });
    lexiconMock.mockReturnValue({
      entries: [
        { wikidataId: "Q1", uuid: "g-regional", name: "Fra regional", treeName: "regional", genrePlaylistUuid: null, isUmbrella: false, viewsCount: 1 },
        { wikidataId: "Q2", uuid: "g-canonical", name: "Fra canonical", treeName: "canonical", genrePlaylistUuid: null, isUmbrella: false, viewsCount: 1 },
      ],
      isPending: false,
      isError: false,
    });
    renderGenreTreePage();
    await screen.findByTestId("genre-tree-view");
    fireEvent.click(screen.getByRole("button", { name: "Type fra" }));

    fireEvent.focus(screen.getByRole("combobox", { name: "Test genre search" }));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "fra" } });
    expect(screen.queryByRole("option", { name: "Fra canonical" })).not.toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole("option", { name: "Fra regional" }));
    await flushNavigation();
    expect(new URL(String(pushState.mock.calls.at(-1)?.[2]), "http://localhost").searchParams.get("genre")).toBe(makeGenreUuid("regional"));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "fran" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: /France/ }));
    expect(routerPushMock).toHaveBeenLastCalledWith("/map?region=Q142");
    regionMapIndexMock.mockReturnValue({ data: undefined, isPending: false, isError: false });
    lexiconMock.mockReturnValue({ entries: [], isPending: false, isError: false });
  });

  it("renders the genre tree read-only, hiding its write controls, when not signed in as admin", async () => {
    renderGenreTreePage();

    const view = await screen.findByTestId("genre-tree-view");
    expect(view.dataset.readonly).toBe("true");
    expect(view).toHaveTextContent("/api/grow-proxy");
    expect(screen.getByRole("heading", { name: "Genre Tree" })).toBeInTheDocument();
  });

  it("renders the genre tree editable when signed in as admin", async () => {
    useIsAdminMock.mockReturnValue(true);

    renderGenreTreePage();

    const view = await screen.findByTestId("genre-tree-view");
    expect(view.dataset.readonly).toBe("false");
  });

  it("clears the selected genre from the URL when the About panel opens", async () => {
    setSearch(`genre=${makeGenreUuid("rock")}&about`);
    renderGenreTreePage();

    expect(await screen.findByRole("region", { name: "TheMusicTree" })).toBeInTheDocument();
    await waitFor(() => expect(replaceState).toHaveBeenCalledWith(null, "", "/?about="));
  });

  it("removes ?about when the About panel is closed", async () => {
    setSearch("about");
    renderGenreTreePage();

    fireEvent.click(await screen.findByRole("button", { name: "Close panel" }));

    await flushNavigation();
    expect(pushState).toHaveBeenCalledWith(null, "", "/");
  });

  it("closes the About panel when a genre is selected", async () => {
    setSearch("about");
    renderGenreTreePage();

    fireEvent.click(await screen.findByRole("button", { name: "Select genre" }));

    await flushNavigation();
    expect(pushState).toHaveBeenCalledWith(null, "", `/?genre=${makeGenreUuid("rock")}`);
  });

  it("keeps About open and collapses the tracklist when ?about loads with the tracklist expanded", async () => {
    setSearch("about");
    tracklistExpanded = true;
    renderGenreTreePage();

    expect(await screen.findByRole("region", { name: "TheMusicTree" })).toBeInTheDocument();
    expect(setTracklistExpandedMock).toHaveBeenCalledWith(false);
    await flushNavigation();
    expect(replaceState).not.toHaveBeenCalled();
  });

  it("closes About when the tracklist expands while About is open", async () => {
    setSearch("about");
    const { rerender } = renderGenreTreePage();
    await screen.findByRole("region", { name: "TheMusicTree" });

    tracklistExpanded = true;
    rerender(
      <GenreTreeViewModeProvider>
        <GenreTreePage />
      </GenreTreeViewModeProvider>,
    );

    await waitFor(() => expect(replaceState).toHaveBeenCalledWith(null, "", "/"));
  });

  it("leaves the URL alone when the tracklist expands without About", async () => {
    const { rerender } = renderGenreTreePage();
    await screen.findByTestId("genre-tree-view");

    tracklistExpanded = true;
    rerender(
      <GenreTreeViewModeProvider>
        <GenreTreePage />
      </GenreTreeViewModeProvider>,
    );

    await flushNavigation();
    expect(replaceState).not.toHaveBeenCalled();
  });

  describe("parent change undo", () => {
    const playlists = [
      { uuid: "playlist-pop", name: "Pop", root: { uuid: "playlist-pop" }, criteria: { uuid: "criteria-pop" } },
      {
        uuid: "playlist-core",
        name: "Core electronic",
        root: { uuid: "playlist-pop" },
        criteria: { uuid: "criteria-core" },
      },
    ];

    it("offers Undo that moves the genre back under its previous parent by criteria uuid", async () => {
      useIsAdminMock.mockReturnValue(true);
      useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: playlists, isLoading: false });
      renderGenreTreePage();
      fireEvent.click(await screen.findByRole("button", { name: "Change parent" }));

      expect(toastSuccessMock).toHaveBeenCalledWith("Moved under Core electronic", expect.anything());
      toastSuccessMock.mock.calls[0][1].action.onClick();
      expect(updateGenreParentMutateMock).toHaveBeenCalledWith({
        uuid: "criteria-dance-pop",
        parent: { uuid: "criteria-pop", name: "Pop" },
        previous: { uuid: "criteria-core", name: "Core electronic" },
      });
    });

    it("offers no Undo when the genre was a root", async () => {
      useIsAdminMock.mockReturnValue(true);
      useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: playlists, isLoading: false });
      renderGenreTreePage();
      fireEvent.click(await screen.findByRole("button", { name: "Change root parent" }));

      expect(toastSuccessMock.mock.calls[0][1].action).toBeUndefined();
    });

    it("still confirms the move, without Undo, when the new parent is not in the loaded list", async () => {
      useIsAdminMock.mockReturnValue(true);
      renderGenreTreePage();
      fireEvent.click(await screen.findByRole("button", { name: "Change parent" }));

      expect(toastSuccessMock).toHaveBeenCalledWith("Parent changed");
    });

    it("does not pass onParentChanged to a non-admin", async () => {
      renderGenreTreePage();
      await screen.findByTestId("genre-tree-view");

      expect(screen.queryByRole("button", { name: "Change parent" })).toBeNull();
    });
  });

  describe("artist filter", () => {
    it("pushes ?artist= in place of the genre when an artist is picked", async () => {
      setSearch(`genre=${makeGenreUuid("rock")}&zoom=pop`);
      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Pick artist" }));

      await flushNavigation();
      expect(pushState).toHaveBeenCalledWith(null, "", "/?zoom=pop&artist=band");
      expect(pushState).toHaveBeenCalledTimes(1);
    });

    it("passes ?artist= to the tree and asks for the artist's visible tree", async () => {
      setSearch("artist=band");
      renderGenreTreePage();

      expect(await screen.findByTestId("artist-filter")).toHaveTextContent("band");
      expect(useVisibleGenrePlaylistsMock).toHaveBeenLastCalledWith(expect.objectContaining({ artistUuid: "band" }));
    });

    it("allows the pop-core view with the artist's pruned tree", async () => {
      setSearch("artist=band");
      useVisibleGenrePlaylistsMock.mockReturnValue({
        genrePlaylists: [{ uuid: "pop", name: "Mainstream Pop", root: { uuid: "pop" } }],
        isLoading: false,
      });

      renderGenreTreePage({ forcePopCore: true });

      const view = await screen.findByTestId("genre-tree-view");
      expect(view.dataset.viewmode).toBe("pop-core");
      expect(hasMainstreamPopRootMock).toHaveBeenLastCalledWith([expect.objectContaining({ id: "pop" })]);
    });

    it("keeps ?artist= and adds ?genre= when a genre is selected", async () => {
      setSearch("artist=band");
      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Select genre" }));

      await flushNavigation();
      expect(pushState).toHaveBeenCalledWith(null, "", `/?artist=band&genre=${makeGenreUuid("rock")}`);
    });

    it("keeps ?genre= alongside ?artist= on load", async () => {
      setSearch(`genre=${makeGenreUuid("rock")}&artist=band`);
      useVisibleGenrePlaylistsMock.mockReturnValue({
        genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }],
        isLoading: false,
      });
      renderGenreTreePage();

      expect(await screen.findByTestId("selected-node")).toHaveTextContent(makeGenreUuid("rock"));
      await flushNavigation();
      expect(replaceState).not.toHaveBeenCalled();
    });

    it("removes only ?artist= when the filter is cleared", async () => {
      setSearch(`genre=${makeGenreUuid("rock")}&artist=band`);
      useVisibleGenrePlaylistsMock.mockReturnValue({
        genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }],
        isLoading: false,
      });
      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Clear artist" }));

      await flushNavigation();
      expect(pushState).toHaveBeenCalledWith(null, "", `/?genre=${makeGenreUuid("rock")}`);
    });

    it("lets About replace the artist", async () => {
      setSearch("artist=band&about");
      renderGenreTreePage();

      expect(await screen.findByRole("region", { name: "TheMusicTree" })).toBeInTheDocument();
      await waitFor(() => expect(replaceState).toHaveBeenCalledWith(null, "", "/?about="));
    });

    it("collapses the tracklist when the artist panel expands, and the panel when the tracklist expands", async () => {
      setSearch("artist=band");
      const { rerender } = renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Expand artist" }));
      expect(screen.getByTestId("artist-expanded")).toHaveTextContent("true");
      expect(setTracklistExpandedMock).toHaveBeenCalledWith(false);

      tracklistExpanded = true;
      rerender(
        <GenreTreeViewModeProvider>
          <GenreTreePage />
        </GenreTreeViewModeProvider>,
      );
      await waitFor(() => expect(screen.getByTestId("artist-expanded")).toHaveTextContent("false"));
    });
  });

  it("keeps the pop-core view mode (radial wheel skeleton) while genre playlists are still loading", async () => {
    useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: [], isLoading: true });
    hasMainstreamPopRootMock.mockReturnValue(false);

    renderGenreTreePage({ forcePopCore: true });

    const view = await screen.findByTestId("genre-tree-view");
    expect(view.dataset.viewmode).toBe("pop-core");
  });

  it("throws once loading finishes and the tree has no Mainstream Pop root", async () => {
    useVisibleGenrePlaylistsMock.mockReturnValue({
      genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }],
      isLoading: false,
    });
    hasMainstreamPopRootMock.mockReturnValue(false);
    // Swallow React's console.error noise from the thrown render error in this test only.
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderGenreTreePage({ forcePopCore: true })).toThrow(
      'Cannot show "pop-core" view: the loaded genre tree has no "Mainstream Pop" root',
    );

    consoleErrorSpy.mockRestore();
  });

  it("does not blame a missing Mainstream Pop root when the genre playlists fetch failed", async () => {
    useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: [], isLoading: false });
    hasMainstreamPopRootMock.mockReturnValue(false);

    renderGenreTreePage({ forcePopCore: true });

    expect(await screen.findByTestId("genre-tree-view")).toBeInTheDocument();
  });

  it("ignores unaccepted roots and their subtrees when checking for a Mainstream Pop root", async () => {
    const row = (uuid: string, rootUuid: string, isUnacceptedRoot = false) => ({
      uuid,
      name: uuid,
      parent: uuid === rootUuid ? null : { uuid: rootUuid },
      root: { uuid: rootUuid },
      tracksCount: 999,
      genreOnlyTracksCount: 0,
      genreAndSubgenresTracksCount: { canonical: 1, regional: 0, all: 1 },
      viewsCount: 0,
      isUnacceptedRoot,
    });
    useVisibleGenrePlaylistsMock.mockReturnValue({
      genrePlaylists: [row("pop", "pop"), row("pop-child", "pop"), row("new", "new", true), row("new-child", "new")],
      isLoading: false,
    });

    renderGenreTreePage();

    await screen.findByTestId("genre-tree-view");
    expect(hasMainstreamPopRootMock).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "pop", itemCount: 1 }),
      expect.objectContaining({ id: "pop-child", itemCount: 1 }),
    ]);
  });

  describe("zoom", () => {
    it("passes ?zoom= to the pop-core view as is", async () => {
      setSearch("zoom=pop-rock&other=1");

      renderGenreTreePage({ forcePopCore: true });

      await waitFor(() => expect(screen.getByTestId("genre-tree-view").dataset.focus).toBe("pop-rock"));
      await flushNavigation();
      expect(replaceState).not.toHaveBeenCalled();
    });

    it("replaces ?zoom= away when the view rejects it", async () => {
      setSearch("zoom=unknown&other=1");

      renderGenreTreePage({ forcePopCore: true });

      fireEvent.click(await screen.findByRole("button", { name: "Reject zoom" }));
      await flushNavigation();
      expect(replaceState).toHaveBeenCalledWith(null, "", "/?other=1");
      expect(pushState).not.toHaveBeenCalled();
    });

    it("passes no focus props outside pop-core and drops ?zoom=", async () => {
      setSearch("zoom=rock");

      render(
        <GenreTreeViewModeProvider>
          <ForceWheelViewMode />
          <GenreTreePage />
        </GenreTreeViewModeProvider>,
      );

      await waitFor(() => expect(screen.getByTestId("genre-tree-view").dataset.viewmode).toBe("wheel"));
      expect(screen.getByTestId("genre-tree-view").dataset.focus).toBe("absent");
      expect(screen.queryByRole("button", { name: "Zoom in" })).not.toBeInTheDocument();
      await waitFor(() => expect(replaceState).toHaveBeenCalledWith(null, "", "/"));
    });

    it("pushes the zoomed uuid and removes the param when the user zooms back out", async () => {
      setSearch("zoom=pop-rock&other=1");

      renderGenreTreePage({ forcePopCore: true });

      fireEvent.click(await screen.findByRole("button", { name: "Zoom in" }));
      await flushNavigation();
      expect(pushState).toHaveBeenLastCalledWith(null, "", "/?zoom=rock&other=1");

      fireEvent.click(screen.getByRole("button", { name: "All genres" }));
      await flushNavigation();
      expect(pushState).toHaveBeenLastCalledWith(null, "", "/?other=1");
      expect(replaceState).not.toHaveBeenCalled();
    });
  });

  describe("genre and viewport URL state", () => {
    it("reads the selected genre from ?genre=", async () => {
      setSearch(`genre=${makeGenreUuid("rock")}`);

      renderGenreTreePage();

      expect(await screen.findByTestId("selected-node")).toHaveTextContent(makeGenreUuid("rock"));
    });

    it("pushes ?genre= when the user selects a genre", async () => {
      setSearch("other=1");

      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Select genre" }));
      await flushNavigation();
      expect(pushState).toHaveBeenCalledWith(null, "", `/?other=1&genre=${makeGenreUuid("rock")}`);
    });

    it("seeds the view from ?view= on load", async () => {
      setSearch("view=12.5,-3,0.75");

      renderGenreTreePage();

      expect(await screen.findByTestId("default-viewport")).toHaveTextContent('{"x":12.5,"y":-3,"zoom":0.75}');
    });

    it("replaces a malformed ?view= away without seeding", async () => {
      setSearch("view=1,2");

      renderGenreTreePage();

      await waitFor(() => expect(replaceState).toHaveBeenCalledWith(null, "", "/"));
      expect(screen.getByTestId("default-viewport")).toHaveTextContent("null");
    });

    it("replaces ?view= with the rounded viewport when the view moves", async () => {
      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Pan" }));
      await flushNavigation();
      expect(replaceState).toHaveBeenCalledWith(null, "", "/?view=10.0%2C-20.0%2C0.50");
      expect(pushState).not.toHaveBeenCalled();
    });

    it("skips the write when the view already matches ?view=", async () => {
      setSearch("view=10.0,-20.0,0.50");

      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Pan" }));
      await flushNavigation();
      expect(replaceState).not.toHaveBeenCalled();
    });

    it("drops ?view= when the user zooms into a frame", async () => {
      setSearch("view=1,2,1");

      renderGenreTreePage({ forcePopCore: true });

      fireEvent.click(await screen.findByRole("button", { name: "Zoom in" }));
      await flushNavigation();
      expect(pushState).toHaveBeenLastCalledWith(null, "", "/?zoom=rock");
    });

    it("drops ?view= and the seed when the view mode changes", async () => {
      setSearch("view=1,2,1");

      render(
        <GenreTreeViewModeProvider>
          <ForceWheelViewMode />
          <GenreTreePage />
        </GenreTreeViewModeProvider>,
      );

      await waitFor(() => expect(replaceState).toHaveBeenCalledWith(null, "", "/"));
      expect(screen.getByTestId("default-viewport")).toHaveTextContent("null");
    });

    it("hands an unknown genre to the view as is and leaves the URL alone", async () => {
      setSearch("genre=ghost&other=1");
      useVisibleGenrePlaylistsMock.mockReturnValue({
        genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }],
        isLoading: false,
      });

      renderGenreTreePage();

      expect(await screen.findByTestId("selected-node")).toHaveTextContent("ghost");
      await flushNavigation();
      expect(replaceState).not.toHaveBeenCalled();
    });

    it("keeps a known ?genre= and waits for the playlists before judging it", async () => {
      setSearch(`genre=${makeGenreUuid("rock")}`);
      useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: [], isLoading: true });

      const { rerender } = renderGenreTreePage();
      await screen.findByTestId("genre-tree-view");
      await flushNavigation();
      expect(replaceState).not.toHaveBeenCalled();

      useVisibleGenrePlaylistsMock.mockReturnValue({
        genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }],
        isLoading: false,
      });
      rerender(
        <GenreTreeViewModeProvider>
          <GenreTreePage />
        </GenreTreeViewModeProvider>,
      );
      await flushNavigation();
      expect(replaceState).not.toHaveBeenCalled();
    });

    it("does not strip a genre selected after the list loaded, before it refetches", async () => {
      useVisibleGenrePlaylistsMock.mockReturnValue({
        genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }],
        isLoading: false,
      });

      const { rerender } = renderGenreTreePage();
      await screen.findByTestId("genre-tree-view");

      setSearch("genre=just-created");
      rerender(
        <GenreTreeViewModeProvider>
          <GenreTreePage />
        </GenreTreeViewModeProvider>,
      );
      await flushNavigation();
      expect(replaceState).not.toHaveBeenCalled();
    });
  });
});
