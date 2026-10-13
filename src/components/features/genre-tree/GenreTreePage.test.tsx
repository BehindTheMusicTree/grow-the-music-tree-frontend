import { describe, it, expect, vi, afterEach } from "vitest";
import { useEffect } from "react";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import GenreTreePage from "./GenreTreePage";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

const routerPushMock = vi.fn();
const routerReplaceMock = vi.fn();
let searchParams = new URLSearchParams();

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
  GenreTreeView: (props: {
    readOnly: boolean;
    getBackendBaseUrl: () => string;
    viewMode: string;
    focusGenreUuid?: string | null;
    onFocusGenreChange?: (uuid: string | null) => void;
  }) => (
    <div
      data-testid="genre-tree-view"
      data-readonly={String(props.readOnly)}
      data-viewmode={props.viewMode}
      data-focus={props.focusGenreUuid === undefined ? "absent" : String(props.focusGenreUuid)}
    >
      {props.getBackendBaseUrl()}
      {props.onFocusGenreChange && (
        <>
          <button onClick={() => props.onFocusGenreChange?.("rock")}>Zoom in</button>
          <button onClick={() => props.onFocusGenreChange?.(null)}>All genres</button>
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

const playlistRow = (
  uuid: string,
  rootUuid: string,
  {
    isUnacceptedRoot = false,
    criteria = true,
    side,
  }: { isUnacceptedRoot?: boolean; criteria?: boolean; side?: "pop" } = {},
) => ({
  uuid,
  name: uuid,
  parent: uuid === rootUuid ? null : { uuid: rootUuid },
  root: { uuid: rootUuid },
  tracksCount: 1,
  isUnacceptedRoot,
  criteria: criteria ? { uuid: `${uuid}-criteria`, side } : null,
});

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
    const zoomPlaylists = [
      playlistRow("pop", "pop"),
      playlistRow("dance-pop", "pop", { side: "pop" }),
      playlistRow("synth-pop", "pop", { side: "pop" }),
      playlistRow("rock", "rock"),
      playlistRow("pop-rock", "rock"),
      playlistRow("genreless", "rock", { criteria: false }),
      playlistRow("new", "new", { isUnacceptedRoot: true }),
      playlistRow("new-child", "new"),
    ];

    it("passes a valid ?zoom= uuid to the pop-core view", async () => {
      useListFullGenrePlaylistsMock.mockReturnValue({ data: zoomPlaylists, isLoading: false });
      searchParams = new URLSearchParams("zoom=pop-rock&other=1");

      renderGenreTreePage();

      expect((await screen.findByTestId("genre-tree-view")).dataset.focus).toBe("pop-rock");
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });

    it.each(["unknown", "genreless", "new-child", "pop"])(
      "replaces ?zoom=%s away without ever passing it down",
      async (zoom) => {
        useListFullGenrePlaylistsMock.mockReturnValue({ data: zoomPlaylists, isLoading: false });
        searchParams = new URLSearchParams(`zoom=${zoom}&other=1`);

        renderGenreTreePage();

        expect((await screen.findByTestId("genre-tree-view")).dataset.focus).toBe("null");
        await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/?other=1", { scroll: false }));
      },
    );

    it("keeps but does not pass ?zoom= while the genre playlists are loading", async () => {
      useListFullGenrePlaylistsMock.mockReturnValue({ data: undefined, isLoading: true });
      searchParams = new URLSearchParams("zoom=rock");

      renderGenreTreePage();

      expect((await screen.findByTestId("genre-tree-view")).dataset.focus).toBe("null");
      expect(routerReplaceMock).not.toHaveBeenCalled();
    });

    it("passes no focus props outside pop-core and drops ?zoom=", async () => {
      useListFullGenrePlaylistsMock.mockReturnValue({ data: zoomPlaylists, isLoading: false });
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

    it("pushes the zoomed uuid and removes the param when zooming back out", async () => {
      useListFullGenrePlaylistsMock.mockReturnValue({ data: zoomPlaylists, isLoading: false });
      searchParams = new URLSearchParams("other=1");

      renderGenreTreePage();

      fireEvent.click(await screen.findByRole("button", { name: "Zoom in" }));
      expect(routerPushMock).toHaveBeenLastCalledWith("/?other=1&zoom=rock", { scroll: false });

      fireEvent.click(screen.getByRole("button", { name: "All genres" }));
      expect(routerPushMock).toHaveBeenLastCalledWith("/?other=1", { scroll: false });
    });
  });
});
