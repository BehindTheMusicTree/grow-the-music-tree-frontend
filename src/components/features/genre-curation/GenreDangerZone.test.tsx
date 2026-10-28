import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import GenreDangerZone from "./GenreDangerZone";
import { makeGenreUuid } from "@behindthemusictree/app-kit/genre-tree/testing";

vi.mock("./GenreCurationProvider", () => ({ useGenreCuration: () => ({ openDialog: vi.fn() }) }));
vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({ useDeleteGenre: vi.fn() }));
vi.mock("@behindthemusictree/app-kit/popup", () => ({ BasePopup: () => null }));
vi.mock("@components/features/curation/GenrePicker", () => ({ default: () => null }));
vi.mock("@hooks/curation/useAliasGenre", () => ({ useAliasGenre: vi.fn(), useAliasPreview: vi.fn() }));
vi.mock("@hooks/curation/useExcludeGenre", () => ({ useExcludeGenre: vi.fn() }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api" }));

describe("GenreDangerZone", () => {
  afterEach(cleanup);

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
});
