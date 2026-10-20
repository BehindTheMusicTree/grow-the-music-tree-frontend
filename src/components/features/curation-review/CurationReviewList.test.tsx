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

    expect(screen.getByRole("link", { name: "genre_parents" })).toHaveAttribute(
      "href",
      "/admin/curation/genre_parents",
    );
    expect(screen.getByRole("link", { name: "Q1" })).toHaveAttribute("href", "/admin/curation/genre/Q1");
    expect(screen.getByRole("link", { name: "Q2" })).toBeInTheDocument();
    expect(screen.getByText("Fusion en conflit")).toBeInTheDocument();
    expect(screen.getByText("Supprimé sur Wikidata")).toBeInTheDocument();
    expect(screen.getByText("Hors de l'arbre")).toBeInTheDocument();
  });

  it("falls back to a generic sentence per reason without evidence", () => {
    render(
      <CurationReviewList
        items={[
          { ...base, list: "a", itemId: "Q1", reason: "redirect_conflict", target: "Q2", evidence: null },
          { ...base, key: "Q3", list: "a", itemId: "Q3", reason: "missing", target: null },
          { ...base, key: "Q4", list: "a", itemId: "Q4", reason: "not_in_tree", target: null },
        ]}
      />,
    );

    expect(screen.getByText(/fusionné sur Wikidata vers un élément déjà présent/)).toBeInTheDocument();
    expect(screen.getByText("L'élément n'existe plus sur Wikidata.")).toBeInTheDocument();
    expect(screen.getByText(/ne répond plus au critère/)).toBeInTheDocument();
  });

  it("explains not_in_tree from evidence", () => {
    render(
      <CurationReviewList
        items={[
          {
            ...base,
            list: "genre_roots",
            itemId: "Q1",
            reason: "not_in_tree",
            target: null,
            evidence: {
              label: "Foo rock",
              modified: "2026-10-12T10:00:00+00:00",
              instanceOf: [
                { id: "Q5", label: "danse" },
                { id: "Q123", label: null },
              ],
              subclassOf: [{ id: "Q9", label: "musique folk" }],
            },
          },
        ]}
      />,
    );

    expect(
      screen.getByText(
        "Plus une instance de « genre musical » (modifié le 12/10/2026). Aujourd'hui : instance de « danse », « Q123 », sous-classe de « musique folk ».",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Foo rock" })).toBeInTheDocument();
  });

  it("explains missing and redirect_conflict from evidence", () => {
    render(
      <CurationReviewList
        items={[
          { ...base, list: "a", itemId: "Q1", reason: "missing", target: null, evidence: { label: "X" } },
          {
            ...base,
            key: "Q3",
            list: "a",
            itemId: "Q3",
            reason: "redirect_conflict",
            target: "Q2",
            evidence: { conflictList: "theme_genres" },
          },
        ]}
      />,
    );

    expect(screen.getByText("L'élément n'existe plus sur Wikidata.")).toBeInTheDocument();
    expect(screen.getByText("Fusionné vers un élément déjà présent dans la liste theme_genres.")).toBeInTheDocument();
  });

  it("explains an indigenous exclusion that lost its P2341", () => {
    render(
      <CurationReviewList
        items={[
          {
            ...base,
            list: "indigenous_to_exclusions",
            itemId: "Q1",
            reason: "not_in_tree",
            target: null,
            evidence: { hasIndigenousTo: false },
          },
        ]}
      />,
    );

    expect(screen.getByText("Plus d'« indigène de » (P2341).")).toBeInTheDocument();
  });

  it("links the QID to Wikidata and its history in a new tab", () => {
    render(<CurationReviewList items={[{ ...base, list: "a", itemId: "Q7", reason: "missing", target: null }]} />);

    const page = screen.getByRole("link", { name: "Q7 sur Wikidata" });
    expect(page).toHaveAttribute("href", "https://www.wikidata.org/wiki/Q7");
    expect(page).toHaveAttribute("target", "_blank");
    expect(page).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Historique de Q7 sur Wikidata" })).toHaveAttribute(
      "href",
      "https://www.wikidata.org/wiki/Q7?action=history",
    );
  });

  it("shows the dropped rule when the column is not the row's own item", () => {
    render(
      <CurationReviewList
        items={[
          {
            ...base,
            key: "Q10",
            column: "parent_item_id",
            list: "main_parent",
            itemId: "Q99",
            reason: "missing",
            target: null,
          },
          {
            ...base,
            key: "Q11",
            column: "overview_item_id",
            list: "regional_overrides",
            itemId: "Q98",
            reason: "missing",
            target: null,
          },
        ]}
      />,
    );

    expect(screen.getByText(/Parent principal de/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Q10" })).toBeInTheDocument();
    expect(screen.getByText(/Vue d'ensemble de/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Q11" })).toBeInTheDocument();
  });
});
