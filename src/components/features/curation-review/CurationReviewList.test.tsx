import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CurationReviewList from "./CurationReviewList";

const base = { key: "Q1", column: "item_id", reportedOn: "2026-10-19T00:00:00Z" };

describe("CurationReviewList", () => {
  afterEach(cleanup);

  it("shows list, QID, French reason and target of each item", () => {
    render(
      <CurationReviewList
        items={[
          { ...base, list: "genre_parents", itemId: "Q1", reason: "redirect_conflict", target: "Q2" },
          { ...base, list: "genre_roots", itemId: "Q3", reason: "missing", target: null },
          { ...base, list: "genre_roots", itemId: "Q4", reason: "not_in_tree", target: null },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "genre_parents" })).toHaveAttribute("href", "/admin/curation/genre_parents");
    expect(screen.getByRole("link", { name: "Q1" })).toHaveAttribute("href", "/admin/curation/genre/Q1");
    expect(screen.getByRole("link", { name: "Q2" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Fusion en conflit" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Supprimé sur Wikidata" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Hors de l'arbre" })).toBeInTheDocument();
  });
});
