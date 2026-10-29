import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type Region } from "@schemas/api/region-map";
import RegionMapView from "./RegionMapView";

const index = RegionMapIndexSchema.parse(fixture);
const requestedHashes: (string | undefined)[] = [];
const failingHashes = new Set<string>();
let chartMounts = 0;

vi.mock("@hooks/useRegionMap", () => ({
  useRegionMapIndex: () => ({ data: index, isPending: false, isError: false }),
  useRegionMapFile: (sha256: string | undefined) => {
    requestedHashes.push(sha256);
    if (sha256 !== undefined && failingHashes.has(sha256)) return { data: undefined, isError: true };
    return { data: sha256 && { type: "FeatureCollection", features: [] }, isError: false };
  },
}));

vi.mock("next/dynamic", () => ({
  default: () =>
    function Chart({
      regions,
      onRegionClick,
    }: {
      regions: Map<string, Region>;
      onRegionClick: (region: Region) => void;
    }) {
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
  requestedHashes.length = 0;
  failingHashes.clear();
  chartMounts = 0;
});

describe("RegionMapView", () => {
  it("loads the world level, drills into a drillable region and back, and overlays a chosen zone", () => {
    render(<RegionMapView />);
    expect(requestedHashes).toContain(index.files["geometry/world.geojson"]);

    fireEvent.click(screen.getByText("click Q142"));
    expect(requestedHashes).toContain(index.files["geometry/Q142.geojson"]);
    expect(screen.getByRole("button", { name: "France" })).toBeTruthy();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Q236626" } });
    expect(requestedHashes).toContain(index.files["zones/Q236626.geojson"]);

    fireEvent.click(screen.getByRole("button", { name: "World" }));
    expect(screen.queryByRole("button", { name: "France" })).toBeNull();
  });

  it("selects a non-drillable region instead of drilling into it", () => {
    render(<RegionMapView />);

    fireEvent.click(screen.getByText("click Q183"));

    expect(screen.getByText("Germany")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Germany" })).toBeNull();
  });

  it("mounts a fresh chart per level so per-level state such as the tooltip does not survive a drill", () => {
    render(<RegionMapView />);
    expect(chartMounts).toBe(1);

    fireEvent.click(screen.getByText("click Q142"));

    expect(chartMounts).toBe(2);
  });

  it("reports a zone that fails to load and keeps the map", () => {
    failingHashes.add(index.files["zones/Q236626.geojson"]);
    render(<RegionMapView />);
    fireEvent.click(screen.getByText("click Q142"));

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Q236626" } });

    expect(screen.getByRole("alert").textContent).toBe("Could not load this zone.");
    expect(screen.getByText("click Q142")).toBeTruthy();
  });
});
