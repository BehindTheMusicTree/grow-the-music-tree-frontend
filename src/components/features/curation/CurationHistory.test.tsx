import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import CurationHistory from "./CurationHistory";
import type { CurationHistoryItem } from "@schemas/api/curation";

const item = (overrides: Partial<CurationHistoryItem>): CurationHistoryItem => ({
  uuid: "00000000-0000-4000-8000-000000000001",
  action: "updated",
  actorPseudo: "alice",
  oldValue: null,
  newValue: null,
  createdOn: "2026-09-30T10:00:00Z",
  entry: "00000000-0000-4000-8000-000000000002",
  ...overrides,
});

const mainParent = {
  name: "main_parent",
  keyColumns: ["item_id"],
  columns: ["item_id", "parent_id", "reason", "exclude_other_parents"],
  columnSpecs: [
    { name: "item_id", kind: "item_id" as const, optional: false },
    { name: "parent_id", kind: "item_id" as const, optional: false },
    { name: "reason", kind: "text" as const, optional: false },
    { name: "exclude_other_parents", kind: "bool" as const, optional: false },
  ],
  description: "",
  count: 0,
};
const labels = { Q1: "Rock", Q2: "Pop", Q3: "Jazz" };

const snapshot = (row: Record<string, string | boolean>) => JSON.stringify({ list_name: "main_parent", ...row });

describe("CurationHistory", () => {
  afterEach(cleanup);

  it("says when nothing was recorded", () => {
    render(<CurationHistory items={[]} lists={[mainParent]} labels={labels} />);
    expect(screen.getByText("Aucune modification enregistrée.")).toBeInTheDocument();
  });

  it("shows only the changed columns of an update, old then new", () => {
    render(
      <CurationHistory
        lists={[mainParent]}
        labels={labels}
        items={[
          item({
            oldValue: snapshot({ item_id: "Q1", parent_id: "Q2", reason: "x" }),
            newValue: snapshot({ item_id: "Q1", parent_id: "Q3", reason: "x" }),
          }),
        ]}
      />,
    );

    expect(screen.getByText("· Modification")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Parent principal imposé" })).toBeInTheDocument();
    expect(screen.getByRole("deletion")).toHaveTextContent("Pop");
    expect(screen.getByRole("insertion")).toHaveTextContent("Jazz");
    expect(screen.queryByText("Raison")).not.toBeInTheDocument();
  });

  it("credits the pipeline and shows a deleted row's old values", () => {
    render(
      <CurationHistory
        lists={[mainParent]}
        labels={labels}
        items={[
          item({
            action: "deleted",
            actorPseudo: null,
            oldValue: snapshot({ item_id: "Q1", exclude_other_parents: true }),
          }),
        ]}
      />,
    );

    const article = screen.getByRole("article");
    expect(within(article).getByText("· pipeline")).toBeInTheDocument();
    expect(within(article).getByText("· Suppression")).toBeInTheDocument();
    expect(within(article).getByRole("link", { name: /Rock/ })).toHaveAttribute("href", "/admin/curation/genre/Q1");
    expect(within(article).getByText("Oui")).toBeInTheDocument();
  });
});
