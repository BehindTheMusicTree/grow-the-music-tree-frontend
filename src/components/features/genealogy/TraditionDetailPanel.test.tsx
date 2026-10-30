import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/genealogy.fixture.json";
import { GenealogySchema } from "@schemas/api/genealogy";
import TraditionDetailPanel from "./TraditionDetailPanel";

const data = GenealogySchema.parse(fixture);

afterEach(cleanup);

function renderPanel(wikidataId: string) {
  const handlers = { onSelect: vi.fn(), onClose: vi.fn(), onOpenInTree: vi.fn() };
  const tradition = data.traditions.find((entry) => entry.wikidataId === wikidataId)!;
  render(<TraditionDetailPanel data={data} tradition={tradition} {...handlers} />);
  return { tradition, ...handlers };
}

describe("TraditionDetailPanel", () => {
  it("shows the label, the Wikidata link and closes", () => {
    const inTree = data.traditions.find((entry) => entry.inCanonicalTree)!;
    const { onClose } = renderPanel(inTree.wikidataId);

    expect(screen.getByRole("heading", { name: inTree.label })).toBeTruthy();
    expect(screen.getByRole("link", { name: inTree.wikidataId }).getAttribute("href")).toBe(
      `https://www.wikidata.org/wiki/${inTree.wikidataId}`,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("offers the genre tree only for traditions in it", () => {
    const inTree = data.traditions.find((entry) => entry.inCanonicalTree)!;
    const { onOpenInTree } = renderPanel(inTree.wikidataId);

    fireEvent.click(screen.getByRole("button", { name: "Open in genre tree" }));
    expect(onOpenInTree).toHaveBeenCalledWith(inTree.wikidataId);
    cleanup();

    renderPanel(data.traditions.find((entry) => !entry.inCanonicalTree)!.wikidataId);
    expect(screen.queryByRole("button", { name: "Open in genre tree" })).toBeNull();
  });

  it("selects a linked tradition", () => {
    const link = data.traditionLinks.find((entry) => entry.kind === "lineage")!;
    const { onSelect } = renderPanel(link.sourceId);
    const target = data.traditions.find((entry) => entry.wikidataId === link.targetId)!;

    fireEvent.click(screen.getByRole("button", { name: target.label }));
    expect(onSelect).toHaveBeenCalledWith(link.targetId);
  });
});
