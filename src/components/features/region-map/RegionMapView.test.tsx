import { makeGenreUuid } from "@behindthemusictree/app-kit/genre-tree/testing";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type Region } from "@schemas/api/region-map";
import RegionMapView from "./RegionMapView";

const index = RegionMapIndexSchema.parse(fixture);
let data: typeof index | null = index;
let chartMounts = 0;
type ChartProps = {
  tileset: string;
  zoneId: string | null;
  selectedId: string | null;
  initialCamera: { lng: number; lat: number; zoom: number } | null;
  focus: { id: string | null; seq: number } | null;
  onCameraChange: (camera: { lng: number; lat: number; zoom: number }) => void;
};
let lastProps: ChartProps;
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

vi.mock("./RegionMapSearch", () => ({ default: ({ onPick }: { onPick: (region: string | null, genre: string | null) => void }) => <button onClick={() => onPick(null, makeGenreUuid("regional"))}>Pick regional genre</button> }));
vi.mock("@behindthemusictree/app-kit-ui/genre-tree", () => ({
  GenreDetailPanel: ({ genreUuid, onClose, onSelectGenre, collapsed, edgeTab }: { genreUuid: string; onClose: () => void; onSelectGenre: (uuid: string) => void; collapsed: boolean; edgeTab: { edge: { label: string; onClick: () => void } | null; center: { label: string; onClick: () => void } | null } }) => (
    <section aria-label="Genre detail" data-collapsed={String(collapsed)}>
      {genreUuid}<button onClick={onClose}>Close genre</button>
      <button onClick={() => onSelectGenre(makeGenreUuid("relative"))}>Relative</button>
      <button onClick={(edgeTab.edge ?? edgeTab.center)!.onClick}>{(edgeTab.edge ?? edgeTab.center)!.label}</button>
    </section>
  ),
}));

vi.mock("./RegionDetailPanel", () => ({
  default: ({ region, onZoomTo, onClose }: { region: Region; onZoomTo: (r: Region) => void; onClose: () => void }) => (
    <section aria-label={`Panel ${region.name}`}>
      <button type="button" onClick={() => onZoomTo(region)}>
        Zoom to
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
    }: ChartProps & {
      regions: Map<string, Region>;
      onRegionClick: (region: Region) => void;
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
  it("opens an explicit genre without a region and preserves the camera on close", async () => {
    setSearch(`genre=${makeGenreUuid("regional")}&at=2,46,5`);
    render(<RegionMapView />);
    expect(screen.getByRole("region", { name: "Genre detail" })).toHaveTextContent(makeGenreUuid("regional"));
    expect(screen.queryByRole("region", { name: /Panel/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close genre" }));
    await flushNavigation();
    expect(url(pushState.mock.calls.at(-1)! ).searchParams.get("genre")).toBeNull();
    expect(url(pushState.mock.calls.at(-1)! ).searchParams.get("at")).toBe("2,46,5");
  });

  it("reopens a collapsed panel when the same genre is picked again", () => {
    setSearch(`genre=${makeGenreUuid("regional")}&region=Q142`);
    render(<RegionMapView />);
    fireEvent.click(screen.getByRole("button", { name: "Hide panel" }));
    expect(screen.getByRole("region", { name: "Genre detail" })).toHaveAttribute("data-collapsed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Pick regional genre" }));
    expect(screen.getByRole("region", { name: "Genre detail" })).toHaveAttribute("data-collapsed", "false");
  });

  it("keeps map context during family navigation", async () => {
    setSearch(`genre=${makeGenreUuid("regional")}&region=Q142&at=2,46,5`);
    render(<RegionMapView />);
    fireEvent.click(screen.getByRole("button", { name: "Relative" }));
    await flushNavigation();
    const params = url(pushState.mock.calls.at(-1)! ).searchParams;
    expect(params.get("genre")).toBe(makeGenreUuid("relative"));
    expect(params.get("region")).toBe("Q142");
    expect(params.get("at")).toBe("2,46,5");
  });

  it("renders nothing before the region map is computed", () => {
    data = null;
    const { container } = render(<RegionMapView />);

    expect(container.childElementCount).toBe(0);
  });

  it("opens a region without a boundary without moving the camera", async () => {
    data = RegionMapIndexSchema.parse({
      ...fixture,
      regions: [...fixture.regions, {
        ...fixture.regions[0],
        id: "JO",
        name: "Joseon",
        kind: "zone",
        parentId: null,
        boundaryStatus: "missing",
        bbox: null,
        mainBbox: null,
        centroid: null,
      }],
    });
    setSearch("region=JO");
    const { unmount } = render(<RegionMapView />);

    expect(screen.getByRole("status")).toHaveTextContent("Boundary unavailable for Joseon");
    expect(screen.getByRole("region", { name: "Panel Joseon" })).toBeInTheDocument();
    expect(lastProps.focus).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Zoom to" }));
    expect(lastProps.focus).toBeNull();
    await flushNavigation();
    expect(pushState).not.toHaveBeenCalled();
    unmount();

    setSearch("");
    render(<RegionMapView />);
    fireEvent.change(screen.getByRole("combobox", { name: "Regions without a boundary" }), {
      target: { value: "JO" },
    });
    await flushNavigation();
    expect(url(pushState.mock.calls[0]).searchParams.get("region")).toBe("JO");
  });

  it("selects a region on click without drilling into it", async () => {
    render(<RegionMapView />);

    fireEvent.click(screen.getByText("click Q142"));

    await flushNavigation();
    expect(url(pushState.mock.calls[0]).searchParams.get("region")).toBe("Q142");
    expect(url(pushState.mock.calls[0]).searchParams.get("path")).toBeNull();
  });

  it("zooms to the selected region from its panel without touching the URL selection", async () => {
    setSearch("region=Q142");
    render(<RegionMapView />);
    const before = lastProps.focus;

    fireEvent.click(screen.getByRole("button", { name: "Zoom to" }));

    expect(lastProps.focus).toEqual({ id: "Q142", seq: (before?.seq ?? 0) + 1 });
    await flushNavigation();
    expect(pushState).not.toHaveBeenCalled();
  });

  it("opens on the URL camera, else on the selected region", () => {
    setSearch("at=2,46,5&region=Q142");
    const { unmount } = render(<RegionMapView />);
    expect(lastProps.initialCamera).toEqual({ lng: 2, lat: 46, zoom: 5 });
    expect(lastProps.focus).toBeNull();
    unmount();

    setSearch("region=Q142");
    render(<RegionMapView />);
    expect(lastProps.initialCamera).toBeNull();
    expect(lastProps.focus).toEqual({ id: "Q142", seq: 0 });
  });

  it("writes the camera with replace, adding no history entry", async () => {
    render(<RegionMapView />);

    act(() => lastProps.onCameraChange({ lng: 2, lat: 46, zoom: 5 }));

    await flushNavigation();
    expect(pushState).not.toHaveBeenCalled();
    expect(url(replaceState.mock.calls.at(-1)!).searchParams.get("at")).toBe("2,46,5");
  });

  it("traces the selection's ancestry in the breadcrumb and flies along it", async () => {
    setSearch("region=Q12130");
    render(<RegionMapView />);
    const breadcrumb = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(breadcrumb.getByRole("button", { name: "Brittany" }).getAttribute("aria-current")).toBe("page");

    fireEvent.click(breadcrumb.getByRole("button", { name: "France" }));
    await flushNavigation();
    expect(url(pushState.mock.calls[0]).searchParams.get("region")).toBe("Q142");
    expect(lastProps.focus).toMatchObject({ id: "Q142" });

    fireEvent.click(breadcrumb.getByRole("button", { name: "World" }));
    await flushNavigation();
    expect(url(pushState.mock.calls[1]).searchParams.get("region")).toBeNull();
    expect(lastProps.focus).toMatchObject({ id: null });
  });

  it("frames an old ?path= link on its deepest known level, then drops it with replace", async () => {
    setSearch("path=Q142/nope");
    render(<RegionMapView />);

    expect(lastProps.focus).toEqual({ id: "Q142", seq: 0 });
    await flushNavigation();
    expect(url(replaceState.mock.calls.at(-1)!).searchParams.get("path")).toBeNull();
  });

  it("drops an unknown region with replace", async () => {
    setSearch("region=nope");
    render(<RegionMapView />);

    await flushNavigation();
    expect(url(replaceState.mock.calls.at(-1)!).searchParams.get("region")).toBeNull();
  });

  it("fills the selected zone", () => {
    setSearch("region=Q236626");
    render(<RegionMapView />);

    expect(lastProps.zoneId).toBe("Q236626");
  });

  it("keeps one map mounted as the selection changes", async () => {
    render(<RegionMapView />);

    fireEvent.click(screen.getByText("click Q142"));
    await flushNavigation();
    setSearch("region=Q142");
    fireEvent.click(screen.getByText("click Q183"));

    expect(chartMounts).toBe(1);
    expect(lastProps.tileset).toBe(index.tileset);
  });
});
