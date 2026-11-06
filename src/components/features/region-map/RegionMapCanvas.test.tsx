import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
    rendered: { properties: Record<string, unknown> }[] = [];
    center = { lng: 0, lat: 0 };
    zoom = 1;

    constructor(public options: unknown) {
      if (hoisted.failConstruction) throw new Error("WebGL unavailable");
      hoisted.instances.push(this);
    }
    private record(name: string, args: unknown[]) {
      (this.calls[name] ??= []).push(args);
    }
    on(type: string, ...rest: unknown[]) {
      const handler = rest[rest.length - 1] as Handler;
      const layers = rest.length === 2 ? ([] as string[]).concat(rest[0] as string | string[]) : [null];
      for (const layer of layers) {
        const key = layer === null ? type : `${type}:${layer}`;
        this.handlers.set(key, [...(this.handlers.get(key) ?? []), handler]);
      }
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
    queryRenderedFeatures(...args: unknown[]) {
      this.record("queryRenderedFeatures", args);
      return this.rendered;
    }
    getCenter() {
      return this.center;
    }
    getZoom() {
      return this.zoom;
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
  rendered: { properties: Record<string, unknown> }[];
  center: { lng: number; lat: number };
  zoom: number;
  emit: (key: string, event?: unknown) => void;
};
const fakeMap = (): Fake => hoisted.instances[hoisted.instances.length - 1] as Fake;

const index = RegionMapIndexSchema.parse(fixture);
const regions = new Map(index.regions.map((region) => [region.id, region]));

type Props = React.ComponentProps<typeof RegionMapCanvas>;

const mount = (props: Partial<Props> = {}) => {
  const handlers = { onRegionClick: vi.fn(), onCameraChange: vi.fn() };
  const element = (overrides: Partial<Props>) => (
    <RegionMapCanvas
      tileset={index.tileset}
      regions={regions}
      rootIds={index.worldChildIds}
      selectedId={null}
      zoneId={null}
      initialCamera={null}
      focus={null}
      {...handlers}
      {...props}
      {...overrides}
    />
  );
  const view = render(element({}));
  return { ...handlers, ...view, rerender: (overrides: Partial<Props>) => view.rerender(element(overrides)) };
};

const feature = (layer: string, properties: Record<string, unknown>) => ({ layer: { id: layer }, properties });

beforeEach(() => {
  hoisted.instances.length = 0;
  hoisted.failConstruction = false;
});
afterEach(cleanup);

describe("RegionMapCanvas", () => {
  it("builds the style from the tileset and opens on the world", () => {
    mount();
    const map = fakeMap();

    expect(map.options).toMatchObject({
      style: {
        sources: { tiles: { url: `pmtiles://https://tiles.example.com/regions/${index.tileset}.pmtiles` } },
        glyphs: "https://tiles.example.com/fonts/{fontstack}/{range}.pbf",
      },
      bounds: [
        [-180, -58],
        [180, 84],
      ],
    });
    expect(hoisted.addProtocol).toHaveBeenCalledWith("pmtiles", expect.any(Function));
  });

  it("opens on the given camera", () => {
    mount({ initialCamera: { lng: 2, lat: 46, zoom: 5 } });

    expect(fakeMap().options).toMatchObject({ center: [2, 46], zoom: 5 });
    expect(fakeMap().options).not.toHaveProperty("bounds");
  });

  it("opens on the region of the focus present at mount, without flying to it again", async () => {
    mount({ focus: { id: "Q142", seq: 0 } });
    const map = fakeMap();
    await act(() => map.emit("load"));

    expect(map.options).toMatchObject({ bounds: [[-5, 42], [8, 51]] });
    expect(map.calls.fitBounds).toBeUndefined();
  });

  it("flies to each new focus request, and to the world for a null id", async () => {
    const { rerender } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    rerender({ focus: { id: "Q142", seq: 1 } });
    rerender({ focus: { id: null, seq: 2 } });

    expect(map.calls.fitBounds.map(([bounds]) => bounds)).toEqual([
      [
        [-5, 42],
        [8, 51],
      ],
      [
        [-180, -58],
        [180, 84],
      ],
    ]);
    expect(hoisted.instances).toHaveLength(1);
  });

  it("reports the camera once a move ends", () => {
    const { onCameraChange } = mount();
    const map = fakeMap();
    map.center = { lng: 2.5, lat: 46.1 };
    map.zoom = 5.25;

    map.emit("moveend");

    expect(onCameraChange).toHaveBeenCalledWith({ lng: 2.5, lat: 46.1, zoom: 5.25 });
  });

  it("recreates the map when the index points at another tileset", () => {
    const { rerender } = mount();
    const first = fakeMap();

    rerender({ tileset: "e".repeat(64) });

    expect(first.removed).toBe(true);
    expect(hoisted.instances).toHaveLength(2);
  });

  it("reports a click on a region and sets the cursor and tooltip on hover", async () => {
    const { onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));
    const event = { features: [feature("region-fill", { id: "Q142", depth: 0 })], point: { x: 10, y: 20 } };
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

  it("treats a region label like its fill: pointer cursor and click select", async () => {
    const { onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));
    const event = { features: [feature("region-fill", { id: "Q142", depth: 0 })], point: { x: 10, y: 20 } };

    await act(() => map.emit("mousemove:region-labels", event));
    expect(map.canvas.style.cursor).toBe("pointer");
    map.emit("click:region-labels", event);
    expect(onRegionClick).toHaveBeenCalledWith(expect.objectContaining({ id: "Q142" }));

    await act(() => map.emit("mouseleave:region-labels"));
    expect(map.canvas.style.cursor).toBe("default");
  });

  it("ignores a region MapLibre snaps to the horizon when the pointer is off the globe", async () => {
    const { onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));
    map.surfaceRadius = 100;
    const onGlobe = { features: [feature("region-fill", { id: "Q142", depth: 0 })], point: { x: 10, y: 20 } };
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

  it("picks the deepest region under the pointer, so a subdivision wins over its country", async () => {
    const { onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    map.emit("click:region-hit", {
      features: [feature("region-hit", { id: "Q142", depth: 0 }), feature("region-hit", { id: "Q12130", depth: 1 })],
      point: { x: 10, y: 20 },
    });

    expect(onRegionClick).toHaveBeenCalledWith(expect.objectContaining({ id: "Q12130" }));
  });

  it("selects a zone through its label, over the regions it lies on", async () => {
    const { onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    map.emit("click:zone-labels", {
      features: [feature("region-fill", { id: "Q12130", depth: 1 }), feature("zone-labels", { id: "Q236626" })],
      point: { x: 10, y: 20 },
    });

    expect(onRegionClick).toHaveBeenCalledWith(expect.objectContaining({ id: "Q236626" }));
  });

  it("outlines the selected region and enlarges a selected city", async () => {
    const { rerender } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    rerender({ selectedId: "Q183" });

    expect(map.calls.setFilter).toContainEqual(["region-selected-line", ["==", ["get", "id"], "Q183"]]);
    expect(map.calls.setPaintProperty).toContainEqual([
      "cities",
      "circle-radius",
      ["case", ["==", ["get", "id"], "Q183"], 6, 4],
    ]);
  });

  it("fills the selected zone and keeps it outlined", async () => {
    const { rerender } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    rerender({ zoneId: "Q236626" });

    const zone = ["==", ["get", "id"], "Q236626"];
    expect(map.calls.setFilter).toContainEqual(["zone-fill", zone]);
    expect(map.calls.setFilter).toContainEqual(["zone-line", ["any", expect.anything(), zone]]);
  });

  it("destroys the map on unmount", () => {
    const { unmount } = mount();
    const map = fakeMap();

    unmount();

    expect(map.removed).toBe(true);
  });

  describe("accessible region list", () => {
    const showRendered = async (ids: string[]) => {
      const map = fakeMap();
      map.rendered = ids.map((id) => ({ properties: { id } }));
      await act(() => map.emit("idle"));
    };

    it("lists the regions drawn on the map, once each and by name, pressing the selected one", async () => {
      mount({ selectedId: "Q183" });
      await showRendered(["Q183", "Q142", "Q142"]);

      const list = screen.getByRole("list", { name: "Regions on the map" });
      const buttons = within(list).getAllByRole("button");
      expect(buttons.map((button) => button.textContent)).toEqual(["France", "Germany"]);
      expect(buttons[0].getAttribute("aria-pressed")).toBe("false");
      expect(buttons[1].getAttribute("aria-pressed")).toBe("true");
    });

    it("follows what the map draws as it moves", async () => {
      mount();
      await showRendered(["Q142"]);
      await showRendered(["Q12130", "Q236626"]);

      expect(screen.queryByRole("button", { name: /^France/ })).toBeNull();
      expect(screen.getByRole("button", { name: /^Brittany/ })).toBeTruthy();
      expect(screen.getByRole("button", { name: /^Celtic nations/ })).toBeTruthy();
    });

    it("reports a click on a list button", async () => {
      const { onRegionClick } = mount();
      await showRendered(["Q142"]);

      fireEvent.click(screen.getByRole("button", { name: /^France/ }));

      expect(onRegionClick).toHaveBeenCalledWith(expect.objectContaining({ id: "Q142" }));
    });

    it("shows the tooltip while a button has focus", async () => {
      mount();
      await showRendered(["Q142"]);
      const button = screen.getByRole("button", { name: /^France/ });

      await act(() => button.focus());
      expect(screen.queryByText(/France · 120 songs/, { selector: "[data-tooltip]" })).not.toBeNull();

      await act(() => button.blur());
      expect(screen.queryByText(/France · 120 songs/, { selector: "[data-tooltip]" })).toBeNull();
    });
  });

  it("reports a WebGL failure and offers the region hierarchy instead", () => {
    hoisted.failConstruction = true;

    mount();

    expect(screen.getByRole("alert").textContent).toMatch(/cannot be displayed/);
    expect(screen.getByRole("button", { name: /^France/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Brittany/ })).toBeTruthy();
    expect(screen.getByText("Subdivisions of France")).toBeTruthy();
  });
});
