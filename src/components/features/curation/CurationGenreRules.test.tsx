import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import CurationGenreRules from "./CurationGenreRules";

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>()),
  useGenreRemoteSearch: () => ({ genres: [], isError: false, settled: true, pending: false }),
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useInfiniteQuery: () => ({ data: undefined, isFetching: false, hasNextPage: false }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/admin/curation/genre/Q1",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useValidatedMutation: () => ({ mutate: vi.fn(), formErrors: [], isPending: false }),
  useQueryWithParse: () => ({ data: undefined, isFetching: false }),
}));

const canonicalParent = {
  name: "canonical_parent_additions",
  keyColumns: ["item_id"],
  columns: ["item_id", "reason", "parent_item_id"],
  columnSpecs: [
    { name: "item_id", kind: "item_id" as const, optional: false },
    { name: "reason", kind: "text" as const, optional: false },
    { name: "parent_item_id", kind: "item_id" as const, optional: false },
  ],
  description: "",
  count: 1,
};
const capitalized = {
  name: "capitalized_words",
  keyColumns: ["word"],
  columns: ["word"],
  columnSpecs: [{ name: "word", kind: "text" as const, optional: false }],
  description: "",
  count: 0,
};
const rule = {
  listName: "canonical_parent_additions",
  uuid: "11111111-1111-4111-8111-111111111111",
  row: { item_id: "Q2", reason: "Because", parent_item_id: "Q1" },
  createdOn: "2026-10-01T00:00:00Z",
  updatedOn: null,
};

describe("CurationGenreRules", () => {
  afterEach(cleanup);

  it("groups rules under their list, linked to it", () => {
    render(
      <CurationGenreRules
        itemId="Q1"
        lists={[capitalized, canonicalParent]}
        rules={{ results: [rule], edges: [], labels: { Q1: "Rock", Q2: "Palaeo" } }}
        appliedExportOn={null}
      />,
    );

    expect(screen.getByRole("heading", { name: "Parents canoniques ajoutés" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Parents canoniques ajoutés" })).toHaveAttribute(
      "href",
      "/admin/curation/canonical_parent_additions",
    );
    expect(within(screen.getByRole("table")).getByRole("link", { name: "Palaeo" })).toHaveAttribute(
      "href",
      "/admin/curation/genre/Q2",
    );
    expect(screen.queryByText(/aucune règle/i)).not.toBeInTheDocument();
  });

  it("says when no rule concerns the genre, and adds one prefilled with it", () => {
    render(
      <CurationGenreRules
        itemId="Q1"
        lists={[capitalized, canonicalParent]}
        rules={{ results: [], edges: [], labels: {} }}
        appliedExportOn={null}
      />,
    );

    expect(screen.getByText(/aucune règle/i)).toBeInTheDocument();
    const select = screen.getByRole("combobox", { name: "Ajouter une règle pour ce genre" });
    expect(
      within(select)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["Parents canoniques ajoutés"]);

    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByRole("combobox", { name: "Genre" })).toHaveValue("Q1");
    expect(dialog.getByText("QID : Q1")).toBeInTheDocument();
  });

  it("lists the genre's edges and opens the edge editor prefilled", () => {
    const edge = {
      uuid: "22222222-2222-4222-8222-222222222222",
      row: {
        id: "33333333-3333-4333-8333-333333333333",
        relation: "canonical_parent" as const,
        item_id: "Q2",
        parent_item_id: "Q1",
        action: null,
        exclude_other_parents: false,
        reason: "",
      },
      createdOn: "2026-10-01T00:00:00Z",
      updatedOn: null,
    };
    render(
      <CurationGenreRules
        itemId="Q1"
        lists={[capitalized]}
        rules={{ results: [], edges: [edge], labels: { Q1: "Rock", Q2: "Palaeo" } }}
        appliedExportOn={null}
      />,
    );

    expect(screen.queryByText(/aucune règle/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Modifier Palaeo → Rock" })).not.toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Ajouter une arête" }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByRole("combobox", { name: "Relation" })).toHaveValue("canonical_parent");
    expect(dialog.getByRole("combobox", { name: "Genre" })).toHaveValue("Rock");
    expect(dialog.getByText("QID : Q1")).toBeInTheDocument();
  });
});
