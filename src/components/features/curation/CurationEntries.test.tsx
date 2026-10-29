import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within, act } from "@testing-library/react";
import CurationEntries from "./CurationEntries";

const replaceMock = vi.fn();
const pushMock = vi.fn();
const mutateMock = vi.fn();
const formErrorsMock = vi.fn((): { field: string; message: string }[] => []);
const searchResultsMock = vi.fn(() => ({ results: [] as { id: string; label: string }[] }));
let searchParams = new URLSearchParams();

vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useInfiniteQuery: () => ({ data: undefined, isFetching: false, hasNextPage: false }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock, refresh: vi.fn() }),
  usePathname: () => "/admin/curation/main_parent",
  useSearchParams: () => searchParams,
}));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useValidatedMutation: () => ({ mutate: mutateMock, formErrors: formErrorsMock(), isPending: false }),
  useQueryWithParse: ({ enabled }: { enabled: boolean }) => ({
    data: enabled ? searchResultsMock() : undefined,
    isFetching: false,
  }),
}));

const list = {
  name: "main_parent",
  keyColumns: ["item_id"],
  columns: ["item_id", "reason", "parent_item_id", "exclude_other_parents"],
  columnSpecs: [
    { name: "item_id", kind: "item_id" as const, optional: false },
    { name: "reason", kind: "text" as const, optional: false },
    { name: "parent_item_id", kind: "item_id" as const, optional: false },
    { name: "exclude_other_parents", kind: "bool" as const, optional: false },
  ],
  description: "Forced main parent.",
  count: 1,
};
const entry = {
  uuid: "11111111-1111-4111-8111-111111111111",
  row: { item_id: "Q1", reason: "Because", parent_item_id: "Q2", exclude_other_parents: true },
  createdOn: "2026-10-01T00:00:00Z",
  updatedOn: null,
};
const entries = { overallTotal: 1, page: 1, totalPages: 1, results: [entry], labels: { Q1: "Palaeo", Q2: "Rock" } };

const renderEntries = (props: Partial<{ q: string; showQid: boolean; appliedExportOn: string | null }> = {}) =>
  render(
    <CurationEntries
      list={list}
      entries={entries}
      q=""
      ordering="key"
      showQid={false}
      appliedExportOn={null}
      {...props}
    />,
  );

describe("CurationEntries", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    searchParams = new URLSearchParams();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
    formErrorsMock.mockReturnValue([]);
    searchResultsMock.mockReturnValue({ results: [] });
  });

  it.each([
    [null, false],
    ["2026-09-30T00:00:00Z", true],
    ["2026-10-01T00:00:00Z", false],
  ])("flags entries edited since the last applied run (applied %s)", (appliedExportOn, pending) => {
    renderEntries({ appliedExportOn });
    const row = within(screen.getByRole("table"));
    expect(row.queryByText("En attente") !== null).toBe(pending);
  });

  it("shows genre names with French headers, and QIDs only once toggled on", () => {
    renderEntries();
    const table = within(screen.getByRole("table"));
    expect(table.getByRole("columnheader", { name: "Genre" })).toBeInTheDocument();
    expect(table.getByRole("columnheader", { name: "Parent" })).toBeInTheDocument();
    expect(table.queryByRole("columnheader", { name: "Nom du genre" })).not.toBeInTheDocument();
    expect(table.getByText("Rock")).toBeInTheDocument();
    expect(table.queryByText("Q2")).not.toBeInTheDocument();
    cleanup();

    renderEntries({ showQid: true });
    expect(within(screen.getByRole("table")).getByText("Q2")).toBeInTheDocument();
  });

  it("toggles the QID display through the URL", () => {
    searchParams = new URLSearchParams("page=2");
    renderEntries();
    fireEvent.click(screen.getByRole("checkbox", { name: "Afficher les QID" }));
    expect(replaceMock).toHaveBeenCalledWith("/admin/curation/main_parent?page=2&qid=1");
  });

  it("searches once typing settles, back on page 1", () => {
    searchParams = new URLSearchParams("page=3&qid=1");
    renderEntries();
    fireEvent.change(screen.getByRole("searchbox", { name: "Rechercher" }), { target: { value: " rock " } });
    expect(replaceMock).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(300));
    expect(replaceMock).toHaveBeenCalledWith("/admin/curation/main_parent?qid=1&q=rock");
  });

  it("deletes an entry after confirmation", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderEntries();
    fireEvent.click(within(screen.getByRole("table")).getByRole("button", { name: "Supprimer Palaeo" }));
    expect(window.confirm).toHaveBeenCalledWith("Supprimer Palaeo ?");
    expect(mutateMock).toHaveBeenCalledWith(null);
  });

  it("links an entry to its history", () => {
    renderEntries();
    expect(within(screen.getByRole("table")).getByRole("link", { name: "Historique de Palaeo" })).toHaveAttribute(
      "href",
      "/admin/curation/history?list=main_parent&entry=11111111-1111-4111-8111-111111111111",
    );
  });

  it("picks an item by name, filling its QID only", () => {
    searchResultsMock.mockReturnValue({
      results: [
        { id: "Q8341", label: "Jazz" },
        { id: "LOCAL:jazz-fusion", label: "Jazz fusion" },
      ],
    });
    renderEntries();
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
    const dialog = within(screen.getByRole("dialog"));

    fireEvent.change(dialog.getByRole("combobox", { name: "Genre" }), { target: { value: "jaz" } });
    act(() => vi.advanceTimersByTime(250));
    expect(dialog.getAllByRole("option")).toHaveLength(2);
    fireEvent.mouseDown(dialog.getByRole("option", { name: /Q8341/ }));
    expect(dialog.getByText("QID : Q8341")).toBeInTheDocument();

    fireEvent.click(dialog.getByRole("button", { name: "Enregistrer" }));
    expect(mutateMock).toHaveBeenCalledWith({
      row: expect.objectContaining({ item_id: "Q8341" }),
    });
    expect(mutateMock.mock.calls[0][0].row).not.toHaveProperty("item_label");
  });

  it("takes a QID typed as is and opens existing entries on their names", () => {
    renderEntries();
    fireEvent.click(within(screen.getByRole("table")).getByRole("button", { name: "Modifier Palaeo" }));
    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByRole("combobox", { name: "Parent" })).toHaveValue("Rock");

    fireEvent.change(dialog.getByRole("combobox", { name: "Parent" }), { target: { value: "Q11399" } });
    fireEvent.click(dialog.getByRole("button", { name: "Enregistrer" }));
    expect(mutateMock).toHaveBeenCalledWith({
      row: expect.objectContaining({ item_id: "Q1", parent_item_id: "Q11399", exclude_other_parents: "true" }),
    });
  });

  it("shows save errors under their column title", () => {
    formErrorsMock.mockReturnValue([{ field: "row.parent_item_id", message: "Invalid item id" }]);
    renderEntries();
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
    expect(within(screen.getByRole("dialog")).getByRole("alert")).toHaveTextContent("Parent : Invalid item id");
  });
});
