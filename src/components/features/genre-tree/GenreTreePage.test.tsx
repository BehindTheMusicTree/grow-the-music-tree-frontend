import { describe, it, expect, vi, afterEach } from "vitest";
import { useEffect } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import GenreTreePage from "./GenreTreePage";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

const useListFullGenrePlaylistsMock = vi.fn(() => ({ data: { results: [] }, isLoading: false }));

vi.mock("@behindthemusictree/app-kit/popup", () => ({
  usePopup: () => ({ showPopup: vi.fn(), hidePopup: vi.fn() }),
}));

vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useCreateGenre: () => ({ mutate: vi.fn(), formErrors: [] }),
  useUpdateGenre: () => ({ renameGenre: vi.fn(), formErrors: [] }),
  useListFullGenrePlaylists: () => useListFullGenrePlaylistsMock(),
  hasMainstreamPopRoot: () => false,
  makeCriteriaPlaylistDetailedSchema: () => ({}),
  YoutubeTrackDetailedSchema: {},
  GenreTreeView: (props: { readOnly: boolean; getBackendBaseUrl: () => string; viewMode: string }) => (
    <div data-testid="genre-tree-view" data-readonly={String(props.readOnly)} data-viewmode={props.viewMode}>
      {props.getBackendBaseUrl()}
    </div>
  ),
  GenreTreeSkeleton: () => <div data-testid="genre-tree-skeleton" />,
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

function renderGenreTreePage(
  props: { getBackendBaseUrl: () => string; title: string; readOnly: boolean },
  { forcePopCore = false }: { forcePopCore?: boolean } = {},
) {
  return render(
    <GenreTreeViewModeProvider>
      {forcePopCore && <ForcePopCoreViewMode />}
      <GenreTreePage {...props} />
    </GenreTreeViewModeProvider>,
  );
}

describe("GenreTreePage", () => {
  afterEach(() => {
    cleanup();
    useListFullGenrePlaylistsMock.mockReturnValue({ data: { results: [] }, isLoading: false });
  });

  it("passes readOnly={false} through for the live reference variant", async () => {
    renderGenreTreePage({ getBackendBaseUrl: () => "/api/grow-proxy", title: "Reference Genre Tree", readOnly: false });

    const view = await screen.findByTestId("genre-tree-view");
    expect(view.dataset.readonly).toBe("false");
    expect(view).toHaveTextContent("/api/grow-proxy");
    expect(screen.getByRole("heading", { name: "Reference Genre Tree" })).toBeInTheDocument();
  });

  it("passes readOnly={true} through for the prototype variant", async () => {
    renderGenreTreePage({
      getBackendBaseUrl: () => "/api/grow-prototype-proxy",
      title: "Prototype Genre Tree (Demo)",
      readOnly: true,
    });

    const view = await screen.findByTestId("genre-tree-view");
    expect(view.dataset.readonly).toBe("true");
    expect(view).toHaveTextContent("/api/grow-prototype-proxy");
    expect(screen.getByRole("heading", { name: "Prototype Genre Tree (Demo)" })).toBeInTheDocument();
  });

  it("keeps the pop-core view mode (radial wheel skeleton) while genre playlists are still loading", async () => {
    useListFullGenrePlaylistsMock.mockReturnValue({ data: undefined, isLoading: true });

    renderGenreTreePage(
      { getBackendBaseUrl: () => "/api/grow-proxy", title: "Reference Genre Tree", readOnly: false },
      { forcePopCore: true },
    );

    const view = await screen.findByTestId("genre-tree-view");
    expect(view.dataset.viewmode).toBe("pop-core");
  });

  it("falls back to stacked once loading finishes and the tree has no Mainstream Pop root", async () => {
    useListFullGenrePlaylistsMock.mockReturnValue({ data: { results: [] }, isLoading: false });

    renderGenreTreePage(
      { getBackendBaseUrl: () => "/api/grow-proxy", title: "Reference Genre Tree", readOnly: false },
      { forcePopCore: true },
    );

    const view = await screen.findByTestId("genre-tree-view");
    expect(view.dataset.viewmode).toBe("stacked");
  });
});
