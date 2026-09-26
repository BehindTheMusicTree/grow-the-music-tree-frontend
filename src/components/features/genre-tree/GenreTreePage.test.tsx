import { describe, it, expect, vi, afterEach } from "vitest";
import { useEffect } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import GenreTreePage from "./GenreTreePage";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

const useIsAdminMock = vi.fn(() => false);

vi.mock("@hooks/useIsAdmin", () => ({
  useIsAdmin: () => useIsAdminMock(),
}));

const useListFullGenrePlaylistsMock = vi.fn(() => ({ data: { results: [] }, isLoading: false }));

vi.mock("@lib/site-urls", () => ({
  getGrowBackendBaseUrl: () => "/api/grow-proxy",
}));

vi.mock("@behindthemusictree/app-kit/popup", () => ({
  usePopup: () => ({ showPopup: vi.fn(), hidePopup: vi.fn() }),
}));

const hasMainstreamPopRootMock = vi.fn(() => true);

vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useListFullGenrePlaylists: () => useListFullGenrePlaylistsMock(),
  hasMainstreamPopRoot: () => hasMainstreamPopRootMock(),
  makeCriteriaPlaylistDetailedSchema: () => ({}),
  YoutubeTrackDetailedSchema: {},
  GenreTreeView: (props: { readOnly: boolean; getBackendBaseUrl: () => string; viewMode: string }) => (
    <div data-testid="genre-tree-view" data-readonly={String(props.readOnly)} data-viewmode={props.viewMode}>
      {props.getBackendBaseUrl()}
    </div>
  ),
  GenreTreeViewSkeleton: ({ viewMode }: { viewMode: string }) => (
    <div data-testid="genre-tree-view-skeleton" data-viewmode={viewMode} />
  ),
}));

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
    useListFullGenrePlaylistsMock.mockReturnValue({ data: { results: [] }, isLoading: false });
    hasMainstreamPopRootMock.mockReturnValue(true);
    useIsAdminMock.mockReturnValue(false);
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
    useListFullGenrePlaylistsMock.mockReturnValue({ data: { results: [] }, isLoading: false });
    hasMainstreamPopRootMock.mockReturnValue(false);
    // Swallow React's console.error noise from the thrown render error in this test only.
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderGenreTreePage({ forcePopCore: true })).toThrow(
      'Cannot show "pop-core" view: the loaded genre tree has no "Mainstream Pop" root',
    );

    consoleErrorSpy.mockRestore();
  });
});
