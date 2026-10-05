import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import ImportRunHistory from "./ImportRunHistory";
import type { ImportRunsPage } from "@schemas/api/import-runs";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }), usePathname: () => "/admin/imports" }));

const RUNS: ImportRunsPage = {
  overallTotal: 120,
  page: 1,
  totalPages: 3,
  results: [
    { kind: "songs", importedOn: "2026-10-05T09:00:00Z", count: 50, skippedCount: 4 },
    { kind: "canonical_tree", importedOn: "2026-10-04T09:00:00Z", count: 1200, skippedCount: null },
  ],
};

describe("ImportRunHistory", () => {
  afterEach(() => {
    cleanup();
    pushMock.mockClear();
  });

  it("lists runs newest first", () => {
    render(<ImportRunHistory runs={RUNS} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows.map((row) => row.textContent)).toEqual([
      "5 Oct 2026, 11:00Songs504",
      "4 Oct 2026, 11:00Canonical tree1200—",
    ]);
  });

  it("keeps the kind filter when paginating", () => {
    render(<ImportRunHistory runs={RUNS} kind="songs" />);

    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(pushMock).toHaveBeenCalledWith("/admin/imports?kind=songs&page=2");
  });

  it("filters by kind from the first page", () => {
    render(<ImportRunHistory runs={{ ...RUNS, page: 2 }} kind="songs" />);

    fireEvent.change(screen.getByRole("combobox", { name: "Kind" }), { target: { value: "regional_tree" } });
    expect(pushMock).toHaveBeenLastCalledWith("/admin/imports?kind=regional_tree");

    fireEvent.change(screen.getByRole("combobox", { name: "Kind" }), { target: { value: "" } });
    expect(pushMock).toHaveBeenLastCalledWith("/admin/imports");
  });

  it("says when there is no import yet", () => {
    render(<ImportRunHistory runs={{ overallTotal: 0, page: 1, totalPages: 1, results: [] }} />);

    expect(screen.getByText("No imports yet")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
