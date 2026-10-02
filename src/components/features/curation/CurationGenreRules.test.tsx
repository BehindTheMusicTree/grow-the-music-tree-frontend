import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import CurationGenreRules from "./CurationGenreRules";

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

const mainParent = {
  name: "main_parent",
  keyColumns: ["item_id"],
  columns: ["item_id", "item_label", "reason", "parent_item_id"],
  description: "",
  count: 1,
};
const capitalized = { name: "capitalized_words", keyColumns: ["word"], columns: ["word"], description: "", count: 0 };
const rule = {
  listName: "main_parent",
  uuid: "11111111-1111-1111-1111-111111111111",
  row: { item_id: "Q2", item_label: "Pala", reason: "Because", parent_item_id: "Q1" },
  createdOn: "2026-10-01T00:00:00Z",
  updatedOn: null,
};

describe("CurationGenreRules", () => {
  afterEach(cleanup);

  it("groups rules under their list, linked to it", () => {
    render(
      <CurationGenreRules
        itemId="Q1"
        lists={[capitalized, mainParent]}
        rules={{ results: [rule], labels: { Q1: "Rock", Q2: "Palaeo" } }}
        appliedExportOn={null}
      />,
    );

    expect(screen.getByRole("heading", { name: "Parent principal imposé" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Parent principal imposé" })).toHaveAttribute(
      "href",
      "/admin/curation/main_parent",
    );
    expect(within(screen.getByRole("table")).getByRole("link", { name: "Palaeo" })).toHaveAttribute(
      "href",
      "/admin/curation/genre/Q2",
    );
    expect(screen.queryByText(/aucune règle/i)).not.toBeInTheDocument();
  });

  it("says when no rule concerns the genre, and adds one prefilled with it", () => {
    render(<CurationGenreRules itemId="Q1" lists={[capitalized, mainParent]} rules={{ results: [], labels: {} }} appliedExportOn={null} />);

    expect(screen.getByText(/aucune règle/i)).toBeInTheDocument();
    const select = screen.getByRole("combobox", { name: "Ajouter une règle pour ce genre" });
    expect(within(select).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Parent principal imposé",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByRole("combobox", { name: "Genre" })).toHaveValue("Q1");
    expect(dialog.getByText("QID : Q1")).toBeInTheDocument();
  });
});
