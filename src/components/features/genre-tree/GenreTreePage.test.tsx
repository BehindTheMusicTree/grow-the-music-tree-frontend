import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import GenreTreePage from "./GenreTreePage";
import { GenreTreeViewModeProvider } from "@contexts/GenreTreeViewModeProvider";

vi.mock("@behindthemusictree/app-kit/popup", () => ({
  usePopup: () => ({ showPopup: vi.fn(), hidePopup: vi.fn() }),
}));

vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useCreateGenre: () => ({ mutate: vi.fn(), formErrors: [] }),
  useUpdateGenre: () => ({ renameGenre: vi.fn(), formErrors: [] }),
  makeCriteriaPlaylistDetailedSchema: () => ({}),
  YoutubeTrackDetailedSchema: {},
  GenreTreeView: (props: { readOnly: boolean; getBackendBaseUrl: () => string }) => (
    <div data-testid="genre-tree-view" data-readonly={String(props.readOnly)}>
      {props.getBackendBaseUrl()}
    </div>
  ),
}));

function renderGenreTreePage(props: { getBackendBaseUrl: () => string; title: string; readOnly: boolean }) {
  return render(
    <GenreTreeViewModeProvider>
      <GenreTreePage {...props} />
    </GenreTreeViewModeProvider>,
  );
}

describe("GenreTreePage", () => {
  afterEach(() => {
    cleanup();
  });

  it("passes readOnly={false} through for the live reference variant", () => {
    renderGenreTreePage({ getBackendBaseUrl: () => "/api/grow-proxy", title: "Reference Genre Tree", readOnly: false });

    const view = screen.getByTestId("genre-tree-view");
    expect(view.dataset.readonly).toBe("false");
    expect(view).toHaveTextContent("/api/grow-proxy");
    expect(screen.getByRole("heading", { name: "Reference Genre Tree" })).toBeInTheDocument();
  });

  it("passes readOnly={true} through for the prototype variant", () => {
    renderGenreTreePage({
      getBackendBaseUrl: () => "/api/grow-prototype-proxy",
      title: "Prototype Genre Tree (Demo)",
      readOnly: true,
    });

    const view = screen.getByTestId("genre-tree-view");
    expect(view.dataset.readonly).toBe("true");
    expect(view).toHaveTextContent("/api/grow-prototype-proxy");
    expect(screen.getByRole("heading", { name: "Prototype Genre Tree (Demo)" })).toBeInTheDocument();
  });
});
