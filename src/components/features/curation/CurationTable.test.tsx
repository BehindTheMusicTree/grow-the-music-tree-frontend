import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import CurationTable from "./CurationTable";

const mutateMock = vi.fn();
const formErrorsMock = vi.fn((): { field: string; message: string }[] => []);

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useValidatedMutation: () => ({ mutate: mutateMock, formErrors: formErrorsMock(), isPending: false }),
}));

const list = {
  name: "main_parent",
  keyColumns: ["item_id"],
  columns: ["item_id", "item_label", "reason", "parent_item_id", "exclude_other_parents"],
  description: "Forced main parent.",
};
const entry = {
  uuid: "11111111-1111-1111-1111-111111111111",
  row: {
    item_id: "Q1",
    item_label: "Pala",
    reason: "Because",
    parent_item_id: "Q2",
    exclude_other_parents: true,
  },
  createdOn: "2026-10-01T00:00:00Z",
  updatedOn: "2026-10-01T00:00:00Z",
};

describe("CurationTable", () => {
  afterEach(() => {
    cleanup();
    mutateMock.mockReset();
    formErrorsMock.mockReturnValue([]);
  });

  it("shows each entry with exclude_other_parents as a checkbox", () => {
    render(<CurationTable list={list} entries={[entry]} />);

    const row = screen.getByRole("row", { name: /Pala/ });
    expect(within(row).getByRole("checkbox", { name: "exclude_other_parents" })).toBeChecked();
  });

  it('adds a row with the checkbox mapped to "true"', () => {
    render(<CurationTable list={list} entries={[]} />);

    fireEvent.change(screen.getByRole("textbox", { name: "item_id" }), { target: { value: "Q3" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "exclude_other_parents" }));
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(mutateMock).toHaveBeenCalledWith({
      row: { item_id: "Q3", item_label: "", reason: "", parent_item_id: "", exclude_other_parents: "true" },
    });
  });

  it('edits a row with the checkbox unchecked mapped to ""', () => {
    render(<CurationTable list={list} entries={[entry]} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const row = screen.getByRole("row", { name: /Save/ });
    fireEvent.change(within(row).getByRole("textbox", { name: "reason" }), { target: { value: "New reason" } });
    fireEvent.click(within(row).getByRole("checkbox", { name: "exclude_other_parents" }));
    fireEvent.click(within(row).getByRole("button", { name: "Save" }));

    expect(mutateMock).toHaveBeenCalledWith({
      row: { item_id: "Q1", item_label: "Pala", reason: "New reason", parent_item_id: "Q2", exclude_other_parents: "" },
    });
  });

  it("shows field and API errors inline", () => {
    formErrorsMock.mockReturnValue([
      { field: "row.item_id", message: "Required" },
      { field: "row", message: "Q1 is already in theme_genres; these lists are mutually exclusive" },
    ]);
    render(<CurationTable list={list} entries={[]} />);

    expect(screen.getByText("item_id: Required")).toBeInTheDocument();
    expect(screen.getByText(/already in theme_genres/)).toBeInTheDocument();
  });
});
