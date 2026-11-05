import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type Region } from "@schemas/api/region-map";
import RegionMapView from "./RegionMapView";

const index = RegionMapIndexSchema.parse(fixture);
let data: typeof index | null = index;
let chartMounts = 0;
let lastProps: { levelId: string; childIds: string[]; tileset: string; zoneId: string | null; selectedId: string | null };
let search = new URLSearchParams();
const navigation = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));

vi.mock("@hooks/useRegionMap", () => ({
  useRegionMapIndex: () => ({ data, isPending: false, isError: false }),
}));

vi.mock("./RegionDetailPanel", () => ({
  default: ({ region, onFocus, onClose }: { region: Region; onFocus: (r: Region) => void; onClose: () => void }) => (
    <section aria-label={`Panel ${region.name}`}>
      <button type="button" onClick={() => onFocus(region)}>
        Focus
      </button>
      <button type="button" onClick={onClose}>
        Close
      </button>
    </section>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
  usePathname: () => "/map",
  useSearchParams: () => search,
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
      childIds: string[];
      tileset: string;
      zoneId: string | null;
      selectedId: string | null;
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

const url = (call: unknown[]) => new URL(String(call[0]), "http://localhost");

beforeEach(() => {
  search = new URLSearchParams();
  navigation.push.mockClear();
  navigation.replace.mockClear();
});

afterEach(() => {
  cleanup();
  chartMounts = 0;
  data = index;
});

describe("RegionMapView", () => {
  it("renders nothing before the region map is computed", () => {
    data = null;
    const { container } = render(<RegionMapView />);

    expect(container.childElementCount).toBe(0);
  });

  it("selects a region on click without drilling into it", () => {
    render(<RegionMapView />);

    fireEvent.click(screen.getByText("click Q142"));

    expect(url(navigation.push.mock.calls[0]).searchParams.get("region")).toBe("Q142");
    expect(url(navigation.push.mock.calls[0]).searchParams.get("path")).toBeNull();
  });

  it("shows the panel of the selected region and focuses into it", () => {
    search = new URLSearchParams("region=Q142");
    render(<RegionMapView />);

    fireEvent.click(screen.getByRole("button", { name: "Focus" }));

    expect(url(navigation.push.mock.calls[0]).searchParams.get("path")).toBe("Q142");
    expect(url(navigation.push.mock.calls[0]).searchParams.get("region")).toBe("Q142");
  });

  it("draws the children of the focused level and follows the path in the breadcrumb", () => {
    search = new URLSearchParams("path=Q142");
    render(<RegionMapView />);

    expect(lastProps.levelId).toBe("Q142");
    expect(lastProps.childIds).toEqual(["Q12130"]);
    expect(screen.getByRole("button", { name: "World" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "France" }));
    expect(url(navigation.push.mock.calls[0]).searchParams.get("region")).toBe("Q142");

    fireEvent.click(screen.getByRole("button", { name: "World" }));
    expect(url(navigation.push.mock.calls[1]).searchParams.get("path")).toBeNull();
  });

  it("drops an invalid tail of the path and an unknown region with replace", () => {
    search = new URLSearchParams("path=Q142/Q183&region=nope");
    render(<RegionMapView />);

    expect(url(navigation.replace.mock.calls[0]).searchParams.get("path")).toBe("Q142");
  });

  it("selects a zone chosen in the selector and overlays it", () => {
    render(<RegionMapView />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Q236626" } });

    expect(lastProps.zoneId).toBe("Q236626");
    expect(url(navigation.push.mock.calls[0]).searchParams.get("region")).toBe("Q236626");
  });

  it("restores the zone overlay and selector from ?region= on load", () => {
    search = new URLSearchParams("region=Q236626");
    render(<RegionMapView />);

    expect(lastProps.zoneId).toBe("Q236626");
    expect(screen.getByRole("combobox")).toHaveValue("Q236626");
  });

  it("keeps one map mounted across levels so the view can animate", () => {
    const { rerender } = render(<RegionMapView />);
    expect(chartMounts).toBe(1);

    search = new URLSearchParams("path=Q142");
    rerender(<RegionMapView />);

    expect(chartMounts).toBe(1);
    expect(lastProps).toMatchObject({ levelId: "Q142", tileset: index.tileset });
  });
});
