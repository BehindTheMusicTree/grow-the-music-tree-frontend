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

const snapshot = (row: Record<string, string | boolean>) => JSON.stringify({ list_name: "main_parent", ...row });

describe("CurationHistory", () => {
  afterEach(cleanup);

  it("says when nothing was recorded", () => {
    render(<CurationHistory items={[]} />);
    expect(screen.getByText("Aucune modification enregistrée.")).toBeInTheDocument();
  });

  it("shows only the changed columns of an update, old then new", () => {
    render(
      <CurationHistory
        items={[
          item({
            oldValue: snapshot({ item_id: "Q1", item_label: "Rock", parent_id: "Q2", parent_label: "Pop", reason: "x" }),
            newValue: snapshot({ item_id: "Q1", item_label: "Rock", parent_id: "Q3", parent_label: "Jazz", reason: "x" }),
          }),
        ]}
      />,
    );

    expect(screen.getByText("· Modification")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Parent principal imposé" })).toBeInTheDocument();
    expect(screen.getByRole("deletion")).toHaveTextContent("Pop");
    expect(screen.getByRole("insertion")).toHaveTextContent("Jazz");
    expect(screen.queryByText("Raison")).not.toBeInTheDocument();
    expect(screen.queryByText("Nom du parent")).not.toBeInTheDocument();
  });

  it("credits the pipeline and shows a deleted row's old values", () => {
    render(
      <CurationHistory
        items={[
          item({
            action: "deleted",
            actorPseudo: null,
            oldValue: snapshot({ item_id: "Q1", item_label: "Rock", exclude_other_parents: true }),
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
