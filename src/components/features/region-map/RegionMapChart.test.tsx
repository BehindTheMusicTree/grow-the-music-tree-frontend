import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type RegionFeatureCollection } from "@schemas/api/region-map";
import RegionMapChart from "./RegionMapChart";

const index = RegionMapIndexSchema.parse(fixture);
const regions = new Map(index.regions.map((region) => [region.id, region]));

const collection = (ids: [string, number][]): RegionFeatureCollection => ({
  type: "FeatureCollection",
  features: ids.map(([id, x]) => ({
    type: "Feature",
    id,
    properties: { id, name: id },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [x, 0],
          [x + 1, 0],
          [x + 1, 1],
          [x, 0],
        ],
      ],
    },
  })),
});

afterEach(cleanup);

describe("RegionMapChart", () => {
  it("draws one path per region, a greyed one for a region without songs, and the zone overlay", () => {
    const { container } = render(
      <RegionMapChart
        level={collection([
          ["Q142", 0],
          ["Q183", 2],
        ])}
        zone={collection([["Q236626", 0]])}
        regions={regions}
        selectedId={null}
        onRegionClick={vi.fn()}
      />,
    );

    expect(container.querySelectorAll("[data-region]")).toHaveLength(2);
    expect(container.querySelector('[data-region="Q183"]')?.getAttribute("fill")).toBe("#e5e7eb");
    expect(container.querySelector('[data-region="Q142"]')?.getAttribute("fill")).not.toBe("#e5e7eb");
    expect(container.querySelector('[data-zone="Q236626"]')?.getAttribute("d")).toMatch(/^M/);
  });

  it("reports a click or Enter on a region", () => {
    const onRegionClick = vi.fn();
    const { container } = render(
      <RegionMapChart
        level={collection([["Q142", 0]])}
        zone={undefined}
        regions={regions}
        selectedId={null}
        onRegionClick={onRegionClick}
      />,
    );
    const france = container.querySelector('[data-region="Q142"]')!;

    fireEvent.click(france);
    fireEvent.keyDown(france, { key: "Enter" });

    expect(onRegionClick).toHaveBeenCalledTimes(2);
    expect(onRegionClick.mock.calls[0][0].id).toBe("Q142");
  });

  it("exposes regions as buttons, marks the selected leaf as pressed, and shows details on keyboard focus", () => {
    render(
      <RegionMapChart
        level={collection([
          ["Q142", 0],
          ["Q183", 2],
        ])}
        zone={undefined}
        regions={regions}
        selectedId="Q183"
        onRegionClick={vi.fn()}
      />,
    );
    const germany = screen.getByRole("button", { name: "Germany · 0 songs · 0 genres" });

    expect(screen.getByRole("group", { name: "Region map" })).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(germany.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /^France/ }).hasAttribute("aria-pressed")).toBe(false);

    fireEvent.focus(germany);
    expect(screen.getByRole("tooltip").textContent).toBe("Germany · 0 songs · 0 genres");
    fireEvent.blur(germany);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
