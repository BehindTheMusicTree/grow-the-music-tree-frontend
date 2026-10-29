import { describe, it, expect, vi, afterEach } from "vitest";
import { useEffect } from "react";
import { act, render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import GenreTreePage from "./GenreTreePage";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

// URL writes are batched into a microtask, so router assertions run after it.
const flushNavigation = () => act(async () => {});

const routerPushMock = vi.fn();
const routerReplaceMock = vi.fn();
let searchParams = new URLSearchParams();
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
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock, replace: routerReplaceMock }),
  usePathname: () => "/",
  useSearchParams: () => searchParams,
}));

const useIsAdminMock = vi.fn(() => false);

vi.mock("@hooks/useIsAdmin", () => ({
  useIsAdmin: () => useIsAdminMock(),
}));

const useVisibleGenrePlaylistsMock = vi.fn<(options: { artistUuid?: string | null }) => { genrePlaylists: unknown[]; isLoading: boolean }>(
  () => ({ genrePlaylists: [], isLoading: false }),
);

vi.mock("@lib/site-urls", () => ({
  getGrowBackendBaseUrl: () => "/api/grow-proxy",
}));

vi.mock("@behindthemusictree/app-kit/popup", () => ({
  usePopup: () => ({ showPopup: vi.fn(), hidePopup: vi.fn() }),
}));

const hasMainstreamPopRootMock = vi.fn<(nodes: { id: string }[]) => boolean>(() => true);

vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useVisibleGenrePlaylists: (options: { artistUuid?: string | null }) => useVisibleGenrePlaylistsMock(options),
  hasMainstreamPopRoot: (nodes: { id: string }[]) => hasMainstreamPopRootMock(nodes),
  useArtist: () => ({ status: "idle" }),
  GenrePlaylistUuidSchema: { parse: (value: string) => value },
}));

vi.mock("@components/features/genre-curation/GenreParentsEditor", () => ({
  default: ({ genre }: { genre: unknown }) => <output aria-label="Parents editor">{JSON.stringify(genre)}</output>,
}));

vi.mock("@behindthemusictree/app-kit-ui/genre-tree", () => ({
  GenreTreeView: (props: {
    readOnly: boolean;
    getBackendBaseUrl: () => string;
    viewMode: string;
    focusGenreUuid?: string | null;
    onFocusGenreChange?: (uuid: string | null, reason: string) => void;
    editMode?: boolean;
    onEditModeChange?: (on: boolean) => void;
    expanded?: boolean;
    onExpandedChange?: (on: boolean) => void;
    selectedNodeId?: string | null;
    onSelectedNodeIdChange?: (id: string | null) => void;
    defaultViewport?: { x: number; y: number; zoom: number };
    onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
    overlayPanel?: {
      title: string;
      content: React.ReactNode;
      onClose: () => void;
      onExpandedChange?: (on: boolean) => void;
    };
    artistUuid?: string | null;
    onArtistUuidChange?: (uuid: string | null) => void;
    artistExpanded?: boolean;
    onArtistExpandedChange?: (expanded: boolean) => void;
    renderParentsEditor?: (node: { id: string }) => React.ReactNode;
  }) => (
    <div
      data-testid="genre-tree-view"
      data-readonly={String(props.readOnly)}
      data-viewmode={props.viewMode}
      data-focus={props.focusGenreUuid === undefined ? "absent" : String(props.focusGenreUuid)}
    >
      {props.getBackendBaseUrl()}
      <span data-testid="artist-filter">{String(props.artistUuid ?? "none")}</span>
      <span data-testid="artist-expanded">{String(props.artistExpanded)}</span>
      <span data-testid="selected-node">{String(props.selectedNodeId ?? "none")}</span>
      <span data-testid="default-viewport">{JSON.stringify(props.defaultViewport ?? null)}</span>
      <button onClick={() => props.onViewportChange?.({ x: 10.04, y: -20, zoom: 0.5 })}>Pan</button>
      <button onClick={() => props.onSelectedNodeIdChange?.("rock")}>Select genre</button>
      <button
        onClick={() => {
          if (props.selectedNodeId) props.onSelectedNodeIdChange?.(null);
          props.onArtistUuidChange?.("band");
        }}
      >
        Pick artist
      </button>
      <button onClick={() => props.onArtistUuidChange?.(null)}>Clear artist</button>
      <button onClick={() => props.onArtistExpandedChange?.(true)}>Expand artist</button>
      {props.selectedNodeId && props.renderParentsEditor?.({ id: props.selectedNodeId })}
      {props.overlayPanel && (
        <section aria-label={props.overlayPanel.title}>
          {props.overlayPanel.content}
          <button onClick={props.overlayPanel.onClose}>Close panel</button>
          {props.overlayPanel.onExpandedChange && (
            <button onClick={() => props.overlayPanel?.onExpandedChange?.(true)}>Expand panel</button>
          )}
        </section>
      )}
      {props.onEditModeChange && (
        <>
          <button onClick={() => props.onEditModeChange?.(!props.editMode)}>{props.editMode ? "Done" : "Edit"}</button>
          <button onClick={() => props.onExpandedChange?.(false)}>Collapse</button>
          <span data-testid="panel-state" data-edit={String(props.editMode)} data-expanded={String(props.expanded)} />
        </>
      )}
      {props.onFocusGenreChange && (
        <>
          <button onClick={() => props.onFocusGenreChange?.("rock", "zoom-in")}>Zoom in</button>
          <button onClick={() => props.onFocusGenreChange?.(null, "back")}>All genres</button>
          <button onClick={() => props.onFocusGenreChange?.(null, "rejected")}>Reject zoom</button>
        </>
      )}
    </div>
  ),
  GenreTreeViewSkeleton: ({ viewMode }: { viewMode: string }) => (
    <div data-testid="genre-tree-view-skeleton" data-viewmode={viewMode} />
  ),
}));

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
    useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: [], isLoading: false });
    hasMainstreamPopRootMock.mockReturnValue(true);
    useIsAdminMock.mockReturnValue(false);
    searchParams = new URLSearchParams();
    routerPushMock.mockReset();
    routerReplaceMock.mockReset();
    tracklistExpanded = false;
    setTracklistExpandedMock.mockReset();
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

  it("gives the parents editor genre uuids, never genre-playlist uuids", async () => {
    useIsAdminMock.mockReturnValue(true);
    searchParams = new URLSearchParams("genre=dance-pop");
    const genre = (playlist: string, name: string, parent: string | null) => ({
      uuid: playlist,
      name,
      parent: parent && { uuid: parent, name: parent },
      root: { uuid: "electronic" },
      criteria: { uuid: `${playlist}-genre`, name, wikidataId: null },
    });
    useVisibleGenrePlaylistsMock.mockReturnValue({
      genrePlaylists: [genre("electronic", "Core electronic", null), genre("dance-pop", "Dance-pop", "electronic")],
      isLoading: false,
    });

    renderGenreTreePage();

    const editor = await screen.findByRole("status", { name: "Parents editor" });
    expect(JSON.parse(editor.textContent ?? "")).toEqual({
      uuid: "dance-pop-genre",
      parent: { uuid: "electronic-genre", name: "Core electronic" },
    });
  });

  it("clears the selected genre from the URL when the About panel opens", async () => {
    searchParams = new URLSearchParams("genre=rock&about");
    renderGenreTreePage();

    expect(await screen.findByRole("region", { name: "TheMusicTree" })).toBeInTheDocument();
    await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/?about=", { scroll: false }));
  });

  it("removes ?about when the About panel is closed", async () => {
    searchParams = new URLSearchParams("about");
    renderGenreTreePage();

    fireEvent.click(await screen.findByRole("button", { name: "Close panel" }));

    await flushNavigation();
    expect(routerPushMock).toHaveBeenCalledWith("/", { scroll: false });
  });

  it("closes the About panel when a genre is selected", async () => {
    searchParams = new URLSearchParams("about");
    renderGenreTreePage();

    fireEvent.click(await screen.findByRole("button", { name: "Select genre" }));

    await flushNavigation();
    expect(routerPushMock).toHaveBeenCalledWith("/?genre=rock", { scroll: false });
  });

  it("keeps About open and collapses the tracklist when ?about loads with the tracklist expanded", async () => {
    searchParams = new URLSearchParams("about");
    tracklistExpanded = true;
    renderGenreTreePage();

    expect(await screen.findByRole("region", { name: "TheMusicTree" })).toBeInTheDocument();
    expect(setTracklistExpandedMock).toHaveBeenCalledWith(false);
    await flushNavigation();
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  it("closes About when the tracklist expands while About is open", async () => {
    searchParams = new URLSearchParams("about");
    const { rerender } = renderGenreTreePage();
    await screen.findByRole("region", { name: "TheMusicTree" });

    tracklistExpanded = true;
    rerender(
      <GenreTreeViewModeProvider>
        <GenreTreePage />
      </GenreTreeViewModeProvider>,
    );

    await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/", { scroll: false }));
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
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  describe("artist filter", () => {
    it("pushes ?artist= in place of the genre when an artist is picked", async () => {
      searchParams = new URLSearchParams("genre=rock&zoom=pop");
      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Pick artist" }));

      await flushNavigation();
      expect(routerPushMock).toHaveBeenCalledWith("/?zoom=pop&artist=band", { scroll: false });
      expect(routerPushMock).toHaveBeenCalledTimes(1);
    });

    it("passes ?artist= to the tree and asks for the artist's visible tree", async () => {
      searchParams = new URLSearchParams("artist=band");
      renderGenreTreePage();

      expect(await screen.findByTestId("artist-filter")).toHaveTextContent("band");
      expect(useVisibleGenrePlaylistsMock).toHaveBeenLastCalledWith(expect.objectContaining({ artistUuid: "band" }));
    });

    it("allows the pop-core view with the artist's pruned tree", async () => {
      searchParams = new URLSearchParams("artist=band");
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
      searchParams = new URLSearchParams("artist=band");
      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Select genre" }));

      await flushNavigation();
      expect(routerPushMock).toHaveBeenCalledWith("/?artist=band&genre=rock", { scroll: false });
    });

    it("keeps ?genre= alongside ?artist= on load", async () => {
      searchParams = new URLSearchParams("genre=rock&artist=band");
      useVisibleGenrePlaylistsMock.mockReturnValue({
        genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }],
        isLoading: false,
      });
      renderGenreTreePage();

      expect(await screen.findByTestId("selected-node")).toHaveTextContent("rock");
      await flushNavigation();
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });

    it("removes only ?artist= when the filter is cleared", async () => {
      searchParams = new URLSearchParams("genre=rock&artist=band");
      useVisibleGenrePlaylistsMock.mockReturnValue({
        genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }],
        isLoading: false,
      });
      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Clear artist" }));

      await flushNavigation();
      expect(routerPushMock).toHaveBeenCalledWith("/?genre=rock", { scroll: false });
    });

    it("lets About replace the artist", async () => {
      searchParams = new URLSearchParams("artist=band&about");
      renderGenreTreePage();

      expect(await screen.findByRole("region", { name: "TheMusicTree" })).toBeInTheDocument();
      await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/?about=", { scroll: false }));
    });

    it("collapses the tracklist when the artist panel expands, and the panel when the tracklist expands", async () => {
      searchParams = new URLSearchParams("artist=band");
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

  it("offers no Edit button to non-admins", async () => {
    renderGenreTreePage();

    await screen.findByTestId("genre-tree-view");
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("expands the panel on Edit and keeps edit mode when collapsed", async () => {
    useIsAdminMock.mockReturnValue(true);
    renderGenreTreePage();

    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
    expect(screen.getByTestId("panel-state").dataset).toMatchObject({ edit: "true", expanded: "true" });

    fireEvent.click(screen.getByRole("button", { name: "Collapse" }));
    expect(screen.getByTestId("panel-state").dataset).toMatchObject({ edit: "true", expanded: "false" });

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByTestId("panel-state").dataset).toMatchObject({ edit: "false", expanded: "false" });
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
      tracksCount: 1,
      isUnacceptedRoot,
    });
    useVisibleGenrePlaylistsMock.mockReturnValue({
      genrePlaylists: [row("pop", "pop"), row("pop-child", "pop"), row("new", "new", true), row("new-child", "new")],
      isLoading: false,
    });

    renderGenreTreePage();

    await screen.findByTestId("genre-tree-view");
    expect(hasMainstreamPopRootMock).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "pop" }),
      expect.objectContaining({ id: "pop-child" }),
    ]);
  });

  describe("zoom", () => {
    it("passes ?zoom= to the pop-core view as is", async () => {
      searchParams = new URLSearchParams("zoom=pop-rock&other=1");

      renderGenreTreePage({ forcePopCore: true });

      await waitFor(() => expect(screen.getByTestId("genre-tree-view").dataset.focus).toBe("pop-rock"));
      await flushNavigation();
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });

    it("replaces ?zoom= away when the view rejects it", async () => {
      searchParams = new URLSearchParams("zoom=unknown&other=1");

      renderGenreTreePage({ forcePopCore: true });

      fireEvent.click(await screen.findByRole("button", { name: "Reject zoom" }));
      await flushNavigation();
      expect(routerReplaceMock).toHaveBeenCalledWith("/?other=1", { scroll: false });
      expect(routerPushMock).not.toHaveBeenCalled();
    });

    it("passes no focus props outside pop-core and drops ?zoom=", async () => {
      searchParams = new URLSearchParams("zoom=rock");

      render(
        <GenreTreeViewModeProvider>
          <ForceWheelViewMode />
          <GenreTreePage />
        </GenreTreeViewModeProvider>,
      );

      await waitFor(() => expect(screen.getByTestId("genre-tree-view").dataset.viewmode).toBe("wheel"));
      expect(screen.getByTestId("genre-tree-view").dataset.focus).toBe("absent");
      expect(screen.queryByRole("button", { name: "Zoom in" })).not.toBeInTheDocument();
      await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/", { scroll: false }));
    });

    it("pushes the zoomed uuid and removes the param when the user zooms back out", async () => {
      searchParams = new URLSearchParams("zoom=pop-rock&other=1");

      renderGenreTreePage({ forcePopCore: true });

      fireEvent.click(await screen.findByRole("button", { name: "Zoom in" }));
      await flushNavigation();
      expect(routerPushMock).toHaveBeenLastCalledWith("/?zoom=rock&other=1", { scroll: false });

      fireEvent.click(screen.getByRole("button", { name: "All genres" }));
      await flushNavigation();
      expect(routerPushMock).toHaveBeenLastCalledWith("/?other=1", { scroll: false });
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });
  });

  describe("genre and viewport URL state", () => {
    it("reads the selected genre from ?genre=", async () => {
      searchParams = new URLSearchParams("genre=rock");

      renderGenreTreePage();

      expect(await screen.findByTestId("selected-node")).toHaveTextContent("rock");
    });

    it("pushes ?genre= when the user selects a genre", async () => {
      searchParams = new URLSearchParams("other=1");

      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Select genre" }));
      await flushNavigation();
      expect(routerPushMock).toHaveBeenCalledWith("/?other=1&genre=rock", { scroll: false });
    });

    it("seeds the view from ?view= on load", async () => {
      searchParams = new URLSearchParams("view=12.5,-3,0.75");

      renderGenreTreePage();

      expect(await screen.findByTestId("default-viewport")).toHaveTextContent('{"x":12.5,"y":-3,"zoom":0.75}');
    });

    it("replaces a malformed ?view= away without seeding", async () => {
      searchParams = new URLSearchParams("view=1,2");

      renderGenreTreePage();

      await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/", { scroll: false }));
      expect(screen.getByTestId("default-viewport")).toHaveTextContent("null");
    });

    it("replaces ?view= with the rounded viewport when the view moves", async () => {
      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Pan" }));
      await flushNavigation();
      expect(routerReplaceMock).toHaveBeenCalledWith("/?view=10.0%2C-20.0%2C0.50", { scroll: false });
      expect(routerPushMock).not.toHaveBeenCalled();
    });

    it("skips the write when the view already matches ?view=", async () => {
      searchParams = new URLSearchParams("view=10.0,-20.0,0.50");

      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Pan" }));
      await flushNavigation();
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });

    it("drops ?view= when the user zooms into a frame", async () => {
      searchParams = new URLSearchParams("view=1,2,1");

      renderGenreTreePage({ forcePopCore: true });

      fireEvent.click(await screen.findByRole("button", { name: "Zoom in" }));
      await flushNavigation();
      expect(routerPushMock).toHaveBeenLastCalledWith("/?zoom=rock", { scroll: false });
    });

    it("drops ?view= and the seed when the view mode changes", async () => {
      searchParams = new URLSearchParams("view=1,2,1");

      render(
        <GenreTreeViewModeProvider>
          <ForceWheelViewMode />
          <GenreTreePage />
        </GenreTreeViewModeProvider>,
      );

      await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/", { scroll: false }));
      expect(screen.getByTestId("default-viewport")).toHaveTextContent("null");
    });

    it("replaces an unknown ?genre= away once the genre playlists have loaded", async () => {
      searchParams = new URLSearchParams("genre=ghost&other=1");
      useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }], isLoading: false });

      renderGenreTreePage();

      await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/?other=1", { scroll: false }));
    });

    it("keeps a known ?genre= and waits for the playlists before judging it", async () => {
      searchParams = new URLSearchParams("genre=rock");
      useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: [], isLoading: true });

      const { rerender } = renderGenreTreePage();
      await screen.findByTestId("genre-tree-view");
      await flushNavigation();
      expect(routerReplaceMock).not.toHaveBeenCalled();

      useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }], isLoading: false });
      rerender(
        <GenreTreeViewModeProvider>
          <GenreTreePage />
        </GenreTreeViewModeProvider>,
      );
      await flushNavigation();
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });

    it("does not strip a genre selected after the list loaded, before it refetches", async () => {
      useVisibleGenrePlaylistsMock.mockReturnValue({ genrePlaylists: [{ uuid: "rock", name: "rock", root: { uuid: "rock" } }], isLoading: false });

      const { rerender } = renderGenreTreePage();
      await screen.findByTestId("genre-tree-view");

      searchParams = new URLSearchParams("genre=just-created");
      rerender(
        <GenreTreeViewModeProvider>
          <GenreTreePage />
        </GenreTreeViewModeProvider>,
      );
      await flushNavigation();
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });
  });
});
