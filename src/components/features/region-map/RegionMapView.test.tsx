import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type Region } from "@schemas/api/region-map";
import RegionMapView from "./RegionMapView";

const index = RegionMapIndexSchema.parse(fixture);
let data: typeof index | null = index;
let chartMounts = 0;
let lastProps: {
  levelId: string;
  childIds: string[];
  tileset: string;
  zoneId: string | null;
  selectedId: string | null;
};
let search = new URLSearchParams();
const pushState = vi.spyOn(window.history, "pushState");
const replaceState = vi.spyOn(window.history, "replaceState");
// URL writes go through the History API and start from window.location, so the rendered params must match it.
const setSearch = (query: string) => {
  Object.getPrototypeOf(window.history).replaceState.call(window.history, null, "", query ? `/map?${query}` : "/map");
  search = new URLSearchParams(query);
};
// URL writes are batched into a microtask, so history assertions run after it.
const flushNavigation = () => act(async () => {});

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

const url = (call: unknown[]) => new URL(String(call[2]), "http://localhost");

beforeEach(() => {
  setSearch("");
  pushState.mockClear();
  replaceState.mockClear();
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

  it("selects a region on click without drilling into it", async () => {
    render(<RegionMapView />);

    fireEvent.click(screen.getByText("click Q142"));

    await flushNavigation();
    expect(url(pushState.mock.calls[0]).searchParams.get("region")).toBe("Q142");
    expect(url(pushState.mock.calls[0]).searchParams.get("path")).toBeNull();
  });

  it("shows the panel of the selected region and focuses into it", async () => {
    setSearch("region=Q142");
    render(<RegionMapView />);

    fireEvent.click(screen.getByRole("button", { name: "Focus" }));

    await flushNavigation();
    expect(url(pushState.mock.calls[0]).searchParams.get("path")).toBe("Q142");
    expect(url(pushState.mock.calls[0]).searchParams.get("region")).toBe("Q142");
  });

  it("draws the children of the focused level and follows the path in the breadcrumb", async () => {
    setSearch("path=Q142");
    render(<RegionMapView />);

    expect(lastProps.levelId).toBe("Q142");
    expect(lastProps.childIds).toEqual(["Q12130"]);
    const breadcrumb = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(breadcrumb.getByRole("button", { name: "France" }).getAttribute("aria-current")).toBe("page");
    fireEvent.click(breadcrumb.getByRole("button", { name: "France" }));
    await flushNavigation();
    expect(url(pushState.mock.calls[0]).searchParams.get("region")).toBe("Q142");

    fireEvent.click(breadcrumb.getByRole("button", { name: "World" }));
    await flushNavigation();
    expect(url(pushState.mock.calls[1]).searchParams.get("path")).toBeNull();
  });

  it("drops an invalid tail of the path and an unknown region with replace", async () => {
    setSearch("path=Q142/Q183&region=nope");
    render(<RegionMapView />);

    await flushNavigation();
    expect(url(replaceState.mock.calls[0]).searchParams.get("path")).toBe("Q142");
  });

  it("restores the zone overlay from ?region= on load", () => {
    setSearch("region=Q236626");
    render(<RegionMapView />);

    expect(lastProps.zoneId).toBe("Q236626");
  });

  it("keeps one map mounted across levels so the view can animate", () => {
    const { rerender } = render(<RegionMapView />);
    expect(chartMounts).toBe(1);

    setSearch("path=Q142");
    rerender(<RegionMapView />);

    expect(chartMounts).toBe(1);
    expect(lastProps).toMatchObject({ levelId: "Q142", tileset: index.tileset });
  });
});
