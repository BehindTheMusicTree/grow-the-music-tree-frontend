import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/genealogy.fixture.json";
import { GenealogySchema } from "@schemas/api/genealogy";
import GenealogyChart from "./GenealogyChart";
import { anchorPosition, buildAnchorIndex } from "./geometry";

const data = GenealogySchema.parse(fixture);

afterEach(cleanup);

function renderChart(selectedId: string | null = null, onSelect = vi.fn()) {
  const { container } = render(<GenealogyChart data={data} selectedId={selectedId} onSelect={onSelect} />);
  return { container, onSelect };
}

describe("GenealogyChart", () => {
  it("draws one marker per placed tradition and reports the unplaced ones", () => {
    const { container } = renderChart();

    expect(container.querySelectorAll("[data-tradition]")).toHaveLength(5);
    expect(screen.getByText("1 traditions without a place are not shown")).toBeTruthy();
  });

  it("draws the band fragments, then the lanes, after each other", () => {
    const { container } = renderChart();

    expect(container.querySelectorAll("[data-fragment]")).toHaveLength(data.bands.length);
    expect(container.querySelectorAll("[data-lane]")).toHaveLength(data.columns.flatMap((column) => column.lanes).length);
    const layers = Array.from(container.querySelectorAll("[data-layer]")).map((layer) => layer.getAttribute("data-layer"));
    expect(layers.indexOf("fragments")).toBeLessThan(layers.indexOf("lanes"));
  });

  it("draws successions as connectors and links as arrows or dashed lines", () => {
    const { container } = renderChart();

    expect(container.querySelectorAll("[data-succession]")).toHaveLength(1);
    const lineage = container.querySelector('[data-link="lineage"]');
    const association = container.querySelector('[data-link="association"]');
    expect(lineage?.getAttribute("marker-end")).toMatch(/^url\(#/);
    expect(lineage?.getAttribute("stroke-dasharray")).toBeNull();
    expect(association?.getAttribute("stroke-dasharray")).toBeTruthy();
    expect(association?.getAttribute("marker-end")).toBeNull();
  });

  it("selects a tradition from its marker, with the mouse or the keyboard", () => {
    const { onSelect } = renderChart();
    const tradition = data.traditions.find((entry) => entry.anchorId && entry.start !== null)!;

    fireEvent.click(screen.getByRole("button", { name: tradition.label }));
    fireEvent.keyDown(screen.getByRole("button", { name: tradition.label }), { key: "Enter" });

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledWith(tradition.wikidataId);
  });

  it("marks the selected tradition as pressed", () => {
    const tradition = data.traditions.find((entry) => entry.anchorId && entry.start !== null)!;
    renderChart(tradition.wikidataId);

    expect(screen.getByRole("button", { name: tradition.label }).getAttribute("aria-pressed")).toBe("true");
  });

  it("offers the same zoom controls as the genre tree", () => {
    renderChart();

    expect(screen.getByRole("button", { name: "Zoom in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fit to frame" })).toBeTruthy();
  });

  it("shows the label and years of a hovered tradition", () => {
    const { container } = renderChart();
    const tradition = data.traditions.find((entry) => entry.anchorId && entry.start !== null)!;

    fireEvent.mouseMove(container.querySelector(`[data-tradition="${tradition.wikidataId}"]`)!, { clientX: 5, clientY: 5 });

    expect(screen.getByRole("tooltip").textContent).toContain(tradition.label);
  });
});

describe("anchorPosition", () => {
  const index = buildAnchorIndex({
    columns: [{ id: "c", position: 3, lanes: [{ entityId: "Q1", label: "L", startYear: null, endYear: 1950 }] }],
    bands: [
      { entityId: "Q2", label: "B", fragment: 0, startPosition: 0, endPosition: 1, startYear: null, endYear: 1000 },
      { entityId: "Q2", label: "B", fragment: 1, startPosition: 6, endPosition: 8, startYear: 1001, endYear: 1950 },
    ],
    successions: [],
    traditions: [],
    traditionLinks: [],
  });

  it("uses the lane's column", () => {
    expect(anchorPosition(index, "Q1", 1900)).toBe(3);
  });

  it("picks the band fragment alive at the year, centred on its columns", () => {
    expect(anchorPosition(index, "Q2", 500)).toBe(0.5);
    expect(anchorPosition(index, "Q2", 1500)).toBe(7);
  });

  it("is null for an unknown anchor", () => {
    expect(anchorPosition(index, "Q9", 1500)).toBeNull();
  });
});
