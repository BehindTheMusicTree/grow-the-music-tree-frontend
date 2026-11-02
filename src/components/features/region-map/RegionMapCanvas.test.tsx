import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type RegionFeatureCollection } from "@schemas/api/region-map";

type Handler = (event: unknown) => void;

const hoisted = vi.hoisted(() => {
  const state = { instances: [] as unknown[], failConstruction: false };
  return state;
});

vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));
vi.mock("maplibre-gl", () => {
  class FakeMap {
    handlers = new Map<string, Handler[]>();
    sourceData = new Map<string, unknown>();
    calls: Record<string, unknown[][]> = {};
    canvas = { style: { cursor: "" } };
    removed = false;

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
    getSource(id: string) {
      return { setData: (data: unknown) => this.sourceData.set(id, data) };
    }
    getCanvas() {
      return this.canvas;
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
    project() {
      return { x: 40, y: 60 };
    }
    remove() {
      this.removed = true;
    }
  }
  return { Map: FakeMap };
});

import RegionMapCanvas from "./RegionMapCanvas";

type Fake = {
  options: Record<string, unknown>;
  sourceData: Map<string, { features: { id: string }[] }>;
  calls: Record<string, unknown[][]>;
  canvas: { style: { cursor: string } };
  removed: boolean;
  emit: (key: string, event?: unknown) => void;
};
const fakeMap = (): Fake => hoisted.instances[hoisted.instances.length - 1] as Fake;

const index = RegionMapIndexSchema.parse(fixture);
const regions = new Map(index.regions.map((region) => [region.id, region]));

const collection = (ids: string[]): RegionFeatureCollection => ({
  type: "FeatureCollection",
  features: ids.map((id) => ({
    type: "Feature",
    id,
    properties: { id, name: id },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    },
  })),
});

const world = collection(["Q142", "Q183"]);
const france = collection(["Q12130"]);

const mount = (props: Partial<React.ComponentProps<typeof RegionMapCanvas>> = {}) => {
  const onRegionClick = vi.fn();
  const view = render(
    <RegionMapCanvas
      levelId="world"
      level={world}
      zone={undefined}
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
  it("loads the level data, colours and framing once ready", async () => {
    mount();
    const map = fakeMap();

    await act(() => map.emit("load"));

    expect(map.sourceData.get("level")?.features.map((feature) => feature.id)).toEqual(["Q142", "Q183"]);
    expect(map.calls.setPaintProperty[0][1]).toBe("fill-color");
    expect(map.calls.fitBounds).toHaveLength(1);
    expect(map.calls.fitBounds[0][1]).toMatchObject({ animate: false });
  });

  it("swaps the level on the same map and animates the new framing", async () => {
    const { rerender, onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    rerender(
      <RegionMapCanvas
        levelId="Q142"
        level={france}
        zone={undefined}
        regions={regions}
        selectedId={null}
        onRegionClick={onRegionClick}
      />,
    );

    expect(hoisted.instances).toHaveLength(1);
    expect(map.removed).toBe(false);
    expect(map.sourceData.get("level")?.features.map((feature) => feature.id)).toEqual(["Q12130"]);
    expect(map.calls.fitBounds).toHaveLength(2);
    expect(map.calls.fitBounds[1][1]).toMatchObject({ animate: true });
  });

  it("reports a click on a region and sets the cursor and tooltip on hover", async () => {
    const { onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));
    const event = { features: [{ properties: { id: "Q142" } }], point: { x: 10, y: 20 } };

    await act(() => map.emit("mousemove:region-fill", event));
    expect(map.canvas.style.cursor).toBe("zoom-in");
    expect(screen.queryByText(/France · 120 songs/)).not.toBeNull();

    map.emit("click:region-fill", event);
    expect(onRegionClick).toHaveBeenCalledWith(expect.objectContaining({ id: "Q142" }));

    await act(() => map.emit("mouseleave:region-fill"));
    expect(map.canvas.style.cursor).toBe("");
    expect(screen.queryByText(/France · 120 songs/)).toBeNull();
  });

  it("marks the selected region through feature state", async () => {
    const { rerender, onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    rerender(
      <RegionMapCanvas
        levelId="world"
        level={world}
        zone={undefined}
        regions={regions}
        selectedId="Q183"
        onRegionClick={onRegionClick}
      />,
    );

    expect(map.calls.setFeatureState).toContainEqual([{ source: "level", id: "Q183" }, { selected: true }]);
  });

  it("shows the zone on its own source", async () => {
    const { rerender, onRegionClick } = mount();
    const map = fakeMap();
    await act(() => map.emit("load"));

    rerender(
      <RegionMapCanvas
        levelId="world"
        level={world}
        zone={collection(["Q236626"])}
        regions={regions}
        selectedId={null}
        onRegionClick={onRegionClick}
      />,
    );

    expect(map.sourceData.get("zone")?.features.map((feature) => feature.id)).toEqual(["Q236626"]);
  });

  it("destroys the map on unmount", () => {
    const { unmount } = mount();
    const map = fakeMap();

    unmount();

    expect(map.removed).toBe(true);
  });

  describe("accessible region list", () => {
    it("lists the regions of the level as buttons, pressing only the non-drillable ones", () => {
      mount({ selectedId: "Q183" });

      expect(
        screen.getByRole("button", { name: /^France · 120 songs · \d+ genres$/ }).getAttribute("aria-pressed"),
      ).toBeNull();
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
