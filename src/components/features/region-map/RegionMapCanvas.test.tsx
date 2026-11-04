import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema } from "@schemas/api/region-map";

type Handler = (event: unknown) => void;

const hoisted = vi.hoisted(() => {
  const state = { instances: [] as unknown[], failConstruction: false, setWorkerUrl: vi.fn(), addProtocol: vi.fn() };
  return state;
});

vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));
vi.mock("maplibre-gl", () => {
  class FakeMap {
    handlers = new Map<string, Handler[]>();
    calls: Record<string, unknown[][]> = {};
    canvas = { style: { cursor: "" } };
    removed = false;
    surfaceRadius = Infinity;

    constructor(public options: unknown) {
      if (hoisted.failConstruction) throw new Error("WebGL unavailable");
      hoisted.instances.push(this);
    }
    private record(name: string, args: unknown[]) {
      (this.calls[name] ??= []).push(args);
    }
    on(type: string, ...rest: unknown[]) {
      const handler = rest[rest.length - 1] as Handler;
      const key = rest.length === 2 ? `${type}:${rest[0]}` : type;
      this.handlers.set(key, [...(this.handlers.get(key) ?? []), handler]);
    }
    emit(key: string, event?: unknown) {
      for (const handler of this.handlers.get(key) ?? []) handler(event);
    }
    getCanvas() {
      return this.canvas;
    }
    setFilter(...args: unknown[]) {
      this.record("setFilter", args);
    }
    setPaintProperty(...args: unknown[]) {
      this.record("setPaintProperty", args);
    }
    setFeatureState(...args: unknown[]) {
      this.record("setFeatureState", args);
    }
    removeFeatureState(...args: unknown[]) {
      this.record("removeFeatureState", args);
    }
    fitBounds(...args: unknown[]) {
      this.record("fitBounds", args);
    }
    // Screen point <-> "lngLat" round trip on a disk of `surfaceRadius` around the origin: a point
    // outside snaps to the disk's edge, like MapLibre snapping a point in space onto the globe.
    unproject([x, y]: [number, number]) {
      const distance = Math.hypot(x, y);
      const scale = distance > this.surfaceRadius ? this.surfaceRadius / distance : 1;
      return { lng: x * scale, lat: y * scale };
    }
    project(lngLat: [number, number] | { lng: number; lat: number }) {
      if (Array.isArray(lngLat)) return { x: 40, y: 60 };
      return { x: lngLat.lng, y: lngLat.lat };
    }
    remove() {
      this.removed = true;
    }
  }
  return { Map: FakeMap, setWorkerUrl: hoisted.setWorkerUrl, addProtocol: hoisted.addProtocol };
});

import RegionMapCanvas from "./RegionMapCanvas";

type Fake = {
  options: Record<string, unknown>;
  calls: Record<string, unknown[][]>;
  canvas: { style: { cursor: string } };
  removed: boolean;
  surfaceRadius: number;
  emit: (key: string, event?: unknown) => void;
};
const fakeMap = (): Fake => hoisted.instances[hoisted.instances.length - 1] as Fake;

const index = RegionMapIndexSchema.parse(fixture);
const regions = new Map(index.regions.map((region) => [region.id, region]));
const WORLD_CHILDREN = index.worldChildIds;

const mount = (props: Partial<React.ComponentProps<typeof RegionMapCanvas>> = {}) => {
  const onRegionClick = vi.fn();
  const view = render(
    <RegionMapCanvas
      levelId="world"
      childIds={WORLD_CHILDREN}
      tileset={index.tileset}
      zoneId={null}
      regions={regions}
      selectedId={null}
      onRegionClick={onRegionClick}
      {...props}
    />,
  );
  return { onRegionClick, ...view };
};

beforeEach(() => {
  hoisted.instances.length = 0;
  hoisted.failConstruction = false;
});
afterEach(cleanup);

describe("RegionMapCanvas", () => {
  it("builds the style from the tileset and frames the level once ready", async () => {
    mount();
    const map = fakeMap();

    expect(map.options).toMatchObject({
      style: {
        sources: { tiles: { url: `pmtiles://https://tiles.example.com/regions/${index.tileset}.pmtiles` } },
        glyphs: "https://tiles.example.com/fonts/{fontstack}/{range}.pbf",
      },
    });
    expect(hoisted.addProtocol).toHaveBeenCalledWith("pmtiles", expect.any(Function));

    await act(() => map.emit("load"));

    expect(map.calls.fitBounds).toHaveLength(1);
    expect(map.calls.fitBounds[0][1]).toMatchObject({ animate: false });
  });

  it("drills down on the same map by filtering, refitting and never fetching", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { rerender, onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    rerender(
      <RegionMapCanvas
        levelId="Q142"
        childIds={["Q12130"]}
        tileset={index.tileset}
        zoneId={null}
        regions={regions}
        selectedId={null}
        onRegionClick={onRegionClick}
      />,
    );

    const level = ["in", ["get", "id"], ["literal", ["Q12130"]]];
    expect(hoisted.instances).toHaveLength(1);
    expect(map.removed).toBe(false);
    expect(map.calls.setFilter).toEqual(
      expect.arrayContaining([
        ["region-fill", level],
        ["region-line", level],
        ["region-labels", level],
      ]),
    );
    expect(map.calls.fitBounds).toHaveLength(2);
    expect(map.calls.fitBounds[1][1]).toMatchObject({ animate: true });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("recreates the map when the index points at another tileset", () => {
    const { rerender, onRegionClick } = mount();
    const first = fakeMap();

    rerender(
      <RegionMapCanvas
        levelId="world"
      childIds={WORLD_CHILDREN}
        tileset={"e".repeat(64)}
        zoneId={null}
        regions={regions}
        selectedId={null}
        onRegionClick={onRegionClick}
      />,
    );

    expect(first.removed).toBe(true);
    expect(hoisted.instances).toHaveLength(2);
  });

  it("reports a click on a region and sets the cursor and tooltip on hover", async () => {
    const { onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));
    const event = { features: [{ properties: { id: "Q142" } }], point: { x: 10, y: 20 } };
    expect(map.canvas.style.cursor).toBe("default");

    await act(() => map.emit("mousemove:region-fill", event));
    expect(map.canvas.style.cursor).toBe("pointer");
    const tooltip = screen.getByText(/France · 120 songs/);
    expect(tooltip.style.left).toBe("22px");
    expect(tooltip.style.top).toBe("32px");

    await act(() => map.emit("mousemove:region-fill", { ...event, point: { x: 50, y: 60 } }));
    expect(screen.getByText(/France · 120 songs/)).toBe(tooltip);
    expect(tooltip.style.left).toBe("62px");
    expect(tooltip.style.top).toBe("72px");

    map.emit("click:region-fill", event);
    expect(onRegionClick).toHaveBeenCalledWith(expect.objectContaining({ id: "Q142" }));

    await act(() => map.emit("mouseleave:region-fill"));
    expect(map.canvas.style.cursor).toBe("default");
    expect(screen.queryByText(/France · 120 songs/)).toBeNull();
  });

  it("ignores a region MapLibre snaps to the horizon when the pointer is off the globe", async () => {
    const { onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));
    map.surfaceRadius = 100;
    const onGlobe = { features: [{ properties: { id: "Q142" } }], point: { x: 10, y: 20 } };
    const inSpace = { ...onGlobe, point: { x: 300, y: 20 } };

    await act(() => map.emit("mousemove:region-fill", onGlobe));
    expect(screen.getByText(/France · 120 songs/)).toBeInTheDocument();

    await act(() => map.emit("mousemove:region-fill", inSpace));
    expect(screen.queryByText(/France · 120 songs/)).toBeNull();
    expect(map.canvas.style.cursor).toBe("default");

    map.emit("click:region-fill", inSpace);
    expect(onRegionClick).not.toHaveBeenCalled();
  });

  it("points MapLibre at its worker bundle", () => {
    expect(hoisted.setWorkerUrl).toHaveBeenCalledWith(expect.stringContaining("maplibre-gl-worker.mjs"));
  });

  it("marks the selected region through feature state on the regions layer", async () => {
    const { rerender, onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    rerender(
      <RegionMapCanvas
        levelId="world"
      childIds={WORLD_CHILDREN}
        tileset={index.tileset}
        zoneId={null}
        regions={regions}
        selectedId="Q183"
        onRegionClick={onRegionClick}
      />,
    );

    expect(map.calls.setFeatureState).toContainEqual([
      { source: "tiles", sourceLayer: "regions", id: "Q183" },
      { selected: true },
    ]);
  });

  it("shows the chosen zone by filtering the zone layers", async () => {
    const { rerender, onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    rerender(
      <RegionMapCanvas
        levelId="world"
      childIds={WORLD_CHILDREN}
        tileset={index.tileset}
        zoneId="Q236626"
        regions={regions}
        selectedId={null}
        onRegionClick={onRegionClick}
      />,
    );

    const zone = ["==", ["get", "id"], "Q236626"];
    expect(map.calls.setFilter).toEqual(
      expect.arrayContaining([
        ["zone-fill", zone],
        ["zone-line", zone],
      ]),
    );
  });

  it("destroys the map on unmount", () => {
    const { unmount } = mount();
    const map = fakeMap();

    unmount();

    expect(map.removed).toBe(true);
  });

  describe("accessible region list", () => {
    it("lists the regions of the level as buttons, pressing the selected one", () => {
      mount({ selectedId: "Q183" });

      expect(
        screen.getByRole("button", { name: /^France · 120 songs · \d+ genres$/ }).getAttribute("aria-pressed"),
      ).toBe("false");
      expect(screen.getByRole("button", { name: /^Germany/ }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.queryByRole("button", { name: /Celtic/ })).toBeNull();
    });

    it("reports a click on a list button", () => {
      const { onRegionClick } = mount();

      fireEvent.click(screen.getByRole("button", { name: /^France/ }));

      expect(onRegionClick).toHaveBeenCalledWith(expect.objectContaining({ id: "Q142" }));
    });

    it("shows the tooltip while a button has focus", async () => {
      mount();
      const button = screen.getByRole("button", { name: /^France/ });

      await act(() => button.focus());
      expect(screen.queryByText(/France · 120 songs/, { selector: "[data-tooltip]" })).not.toBeNull();

      await act(() => button.blur());
      expect(screen.queryByText(/France · 120 songs/, { selector: "[data-tooltip]" })).toBeNull();
    });
  });

  it("reports a WebGL failure and keeps the region list usable", () => {
    hoisted.failConstruction = true;

    mount();

    expect(screen.getByRole("alert").textContent).toMatch(/cannot be displayed/);
    expect(screen.getByRole("button", { name: /^France/ })).toBeTruthy();
  });
});
