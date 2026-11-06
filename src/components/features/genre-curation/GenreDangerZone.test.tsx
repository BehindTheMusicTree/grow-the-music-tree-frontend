import type { ReactNode } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import GenreDangerZone from "./GenreDangerZone";
import { makeGenreUuid } from "@behindthemusictree/app-kit/genre-tree/testing";

const openDialog = vi.fn();
const setRoot = vi.fn();

vi.mock("./GenreCurationProvider", () => ({ useGenreCuration: () => ({ openDialog }) }));
vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({ useDeleteGenre: vi.fn() }));
vi.mock("@behindthemusictree/app-kit-ui/popup", () => ({
  BasePopup: ({ okButtonText, onOk, children }: { okButtonText: string; onOk: () => void; children: ReactNode }) => (
    <div>
      {children}
      <button type="button" onClick={onOk}>
        {okButtonText}
      </button>
    </div>
  ),
}));
vi.mock("@components/features/curation/GenrePicker", () => ({ default: () => null }));
vi.mock("@hooks/curation/useAliasGenre", () => ({ useAliasGenre: vi.fn(), useAliasPreview: vi.fn() }));
vi.mock("@hooks/curation/useExcludeGenre", () => ({ useExcludeGenre: vi.fn() }));
vi.mock("@hooks/curation/useSetGenreRoot", () => ({
  useSetGenreRoot: () => ({ mutate: setRoot, isPending: false }),
}));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api" }));

describe("GenreDangerZone", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("offers Alias of for genres without a wikidata id", () => {
    render(<GenreDangerZone genre={{ uuid: makeGenreUuid("g"), name: "Folk" }} />);

    expect(screen.getByRole("button", { name: "Alias of…" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Exclude…" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("hides Alias of when the genre has a wikidata id", () => {
    render(<GenreDangerZone genre={{ uuid: makeGenreUuid("g"), name: "Folk", wikidataId: "Q1" }} />);

    expect(screen.queryByRole("button", { name: "Alias of…" })).not.toBeInTheDocument();
  });

  it("hides Set as root for a genre without a parent", () => {
    render(<GenreDangerZone genre={{ uuid: makeGenreUuid("g"), name: "Folk" }} />);

    expect(screen.queryByRole("button", { name: "Set as root…" })).not.toBeInTheDocument();
  });

  it("asks for confirmation before setting a genre as root", () => {
    const genre = { uuid: makeGenreUuid("g"), name: "Folk" };
    render(<GenreDangerZone genre={genre} parent={{ uuid: "p", name: "Roots" }} />);

    fireEvent.click(screen.getByRole("button", { name: "Set as root…" }));

    expect(setRoot).not.toHaveBeenCalled();
    const [renderPopup] = openDialog.mock.calls[0];
    render(renderPopup(vi.fn()));
    expect(screen.getByText(/no longer be under Roots/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Set as root" }));

    expect(setRoot).toHaveBeenCalledWith({ uuid: genre.uuid, name: "Folk" }, expect.any(Object));
  });
});
