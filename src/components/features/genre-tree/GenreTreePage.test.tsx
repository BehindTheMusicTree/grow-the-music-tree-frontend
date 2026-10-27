import { describe, it, expect, vi, afterEach } from "vitest";
import { useEffect } from "react";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import GenreTreePage from "./GenreTreePage";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

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

const useListFullGenrePlaylistsMock = vi.fn<() => { data: unknown[] | undefined; isLoading: boolean }>(() => ({
  data: [],
  isLoading: false,
}));

vi.mock("@lib/site-urls", () => ({
  getGrowBackendBaseUrl: () => "/api/grow-proxy",
}));

vi.mock("@behindthemusictree/app-kit/popup", () => ({
  usePopup: () => ({ showPopup: vi.fn(), hidePopup: vi.fn() }),
}));

const hasMainstreamPopRootMock = vi.fn<(nodes: { id: string }[]) => boolean>(() => true);

vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useListFullGenrePlaylists: () => useListFullGenrePlaylistsMock(),
  hasMainstreamPopRoot: (nodes: { id: string }[]) => hasMainstreamPopRootMock(nodes),
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
    overlayPanel?: { title: string; content: React.ReactNode; onClose: () => void };
  }) => (
    <div
      data-testid="genre-tree-view"
      data-readonly={String(props.readOnly)}
      data-viewmode={props.viewMode}
      data-focus={props.focusGenreUuid === undefined ? "absent" : String(props.focusGenreUuid)}
    >
      {props.getBackendBaseUrl()}
      <span data-testid="selected-node">{String(props.selectedNodeId ?? "none")}</span>
      <button onClick={() => props.onSelectedNodeIdChange?.("rock")}>Select genre</button>
      {props.overlayPanel && (
        <section aria-label={props.overlayPanel.title}>
          {props.overlayPanel.content}
          <button onClick={props.overlayPanel.onClose}>Close panel</button>
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
    useListFullGenrePlaylistsMock.mockReturnValue({ data: [], isLoading: false });
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

  it("shows the About panel on ?about and clears the selection", async () => {
    const { rerender } = renderGenreTreePage();
    fireEvent.click(await screen.findByRole("button", { name: "Select genre" }));
    expect(screen.getByTestId("selected-node")).toHaveTextContent("rock");

    searchParams = new URLSearchParams("about");
    rerender(
      <GenreTreeViewModeProvider>
        <GenreTreePage />
      </GenreTreeViewModeProvider>,
    );

    expect(await screen.findByRole("region", { name: "TheMusicTree" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("selected-node")).toHaveTextContent("none"));
  });

  it("removes ?about when the About panel is closed", async () => {
    searchParams = new URLSearchParams("about");
    renderGenreTreePage();

    fireEvent.click(await screen.findByRole("button", { name: "Close panel" }));

    expect(routerPushMock).toHaveBeenCalledWith("/", { scroll: false });
  });

  it("closes the About panel when a genre is selected", async () => {
    searchParams = new URLSearchParams("about");
    renderGenreTreePage();

    fireEvent.click(await screen.findByRole("button", { name: "Select genre" }));

    expect(routerReplaceMock).toHaveBeenCalledWith("/", { scroll: false });
  });

  it("keeps About open and collapses the tracklist when ?about loads with the tracklist expanded", async () => {
    searchParams = new URLSearchParams("about");
    tracklistExpanded = true;
    renderGenreTreePage();

    expect(await screen.findByRole("region", { name: "TheMusicTree" })).toBeInTheDocument();
    expect(setTracklistExpandedMock).toHaveBeenCalledWith(false);
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

    expect(routerReplaceMock).not.toHaveBeenCalled();
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
    useListFullGenrePlaylistsMock.mockReturnValue({ data: undefined, isLoading: true });
    hasMainstreamPopRootMock.mockReturnValue(false);

    renderGenreTreePage({ forcePopCore: true });

    const view = await screen.findByTestId("genre-tree-view");
    expect(view.dataset.viewmode).toBe("pop-core");
  });

  it("throws once loading finishes and the tree has no Mainstream Pop root", async () => {
    useListFullGenrePlaylistsMock.mockReturnValue({ data: [], isLoading: false });
    hasMainstreamPopRootMock.mockReturnValue(false);
    // Swallow React's console.error noise from the thrown render error in this test only.
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderGenreTreePage({ forcePopCore: true })).toThrow(
      'Cannot show "pop-core" view: the loaded genre tree has no "Mainstream Pop" root',
    );

    consoleErrorSpy.mockRestore();
  });

  it("does not blame a missing Mainstream Pop root when the genre playlists fetch failed", async () => {
    useListFullGenrePlaylistsMock.mockReturnValue({ data: undefined, isLoading: false });
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
    useListFullGenrePlaylistsMock.mockReturnValue({
      data: [row("pop", "pop"), row("pop-child", "pop"), row("new", "new", true), row("new-child", "new")],
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
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });

    it("replaces ?zoom= away when the view rejects it", async () => {
      searchParams = new URLSearchParams("zoom=unknown&other=1");

      renderGenreTreePage({ forcePopCore: true });

      fireEvent.click(await screen.findByRole("button", { name: "Reject zoom" }));
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
      expect(routerPushMock).toHaveBeenLastCalledWith("/?zoom=rock&other=1", { scroll: false });

      fireEvent.click(screen.getByRole("button", { name: "All genres" }));
      expect(routerPushMock).toHaveBeenLastCalledWith("/?other=1", { scroll: false });
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });
  });
});
