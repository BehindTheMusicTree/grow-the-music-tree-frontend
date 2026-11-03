import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type Region } from "@schemas/api/region-map";
import RegionMapView from "./RegionMapView";

const index = RegionMapIndexSchema.parse(fixture);
let chartMounts = 0;
let lastProps: { levelId: string; tileset: string; zoneId: string | null };

vi.mock("@hooks/useRegionMap", () => ({
  useRegionMapIndex: () => ({ data: index, isPending: false, isError: false }),
}));

vi.mock("next/dynamic", () => ({
  default: () =>
    function Chart({
      regions,
      onRegionClick,
      ...props
    }: {
      regions: Map<string, Region>;
      onRegionClick: (region: Region) => void;
      levelId: string;
      tileset: string;
      zoneId: string | null;
    }) {
      lastProps = props;
      useEffect(() => {
        chartMounts += 1;
      }, []);
      return (
        <>
          {Array.from(regions.values()).map((region) => (
            <button key={region.id} type="button" onClick={() => onRegionClick(region)}>
              {`click ${region.id}`}
            </button>
          ))}
        </>
      );
    },
}));

afterEach(() => {
  cleanup();
  chartMounts = 0;
});

describe("RegionMapView", () => {
  it("drills into a drillable region and back, and overlays a chosen zone", () => {
    render(<RegionMapView />);

    fireEvent.click(screen.getByText("click Q142"));
    expect(screen.getByRole("button", { name: "France" })).toBeTruthy();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Q236626" } });
    expect(lastProps.zoneId).toBe("Q236626");

    fireEvent.click(screen.getByRole("button", { name: "World" }));
    expect(screen.queryByRole("button", { name: "France" })).toBeNull();
  });

  it("selects a non-drillable region instead of drilling into it", () => {
    render(<RegionMapView />);

    fireEvent.click(screen.getByText("click Q183"));

    expect(screen.getByText("Germany")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Germany" })).toBeNull();
  });

  it("keeps one map mounted across drills so the view can animate between levels", () => {
    render(<RegionMapView />);
    expect(chartMounts).toBe(1);

    fireEvent.click(screen.getByText("click Q142"));

    expect(chartMounts).toBe(1);
  });

  it("hands the tileset, level and zone to the map", () => {
    render(<RegionMapView />);
    expect(lastProps).toMatchObject({ levelId: "world", tileset: index.tileset, zoneId: null });

    fireEvent.click(screen.getByText("click Q142"));

    expect(lastProps.levelId).toBe("Q142");
  });
});
