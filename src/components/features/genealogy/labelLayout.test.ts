import { describe, expect, it } from "vitest";
import { genealogyLabelLayout, sitelinksRange, type LabelLayoutOptions, type LabelMarker } from "./labelLayout";

const marker = (id: string, sitelinks: number, x: number, y: number): LabelMarker => ({
  id,
  label: id,
  sitelinks,
  x,
  y,
  radius: 5,
});

const identity = { k: 1, applyX: (x: number) => x, applyY: (y: number) => y };

const options = (overrides: Partial<LabelLayoutOptions> = {}): LabelLayoutOptions => ({
  transform: identity,
  viewport: { width: 1000, height: 800 },
  headerBottom: 50,
  selectedId: null,
  sitelinksRange: { min: 0, max: 100 },
  minScale: 0.3,
  focusScale: 1,
  ...overrides,
});

const ids = (labels: { id: string }[]) => labels.map(({ id }) => id).sort();

describe("sitelinksRange", () => {
  it("spans the smallest to the largest count", () => {
    expect(sitelinksRange([marker("a", 3, 0, 0), marker("b", 90, 0, 0), marker("c", 12, 0, 0)])).toEqual({ min: 3, max: 90 });
  });
});

describe("genealogyLabelLayout", () => {
  it("sizes labels by importance", () => {
    const [low, high] = ["low", "high"].map(
      (id) => genealogyLabelLayout([marker(id, id === "low" ? 0 : 100, 200, 200)], options({ transform: { ...identity, k: 1 } }))[0]!,
    );

    expect(low.fontSize).toBe(11);
    expect(high.fontSize).toBe(18);
  });

  it("shows only the most important traditions when zoomed out, and more when zoomed in", () => {
    const markers = [marker("big", 100, 100, 200), marker("small", 2, 400, 200)];

    expect(ids(genealogyLabelLayout(markers, options({ transform: { ...identity, k: 0.3 } })))).toEqual(["big"]);
    expect(ids(genealogyLabelLayout(markers, options({ transform: { ...identity, k: 1 } })))).toEqual(["big", "small"]);
  });

  it("keeps the more important label when two collide", () => {
    const markers = [marker("minor", 20, 300, 200), marker("major", 90, 300, 204)];

    const labels = genealogyLabelLayout(markers, options());

    expect(labels.find(({ id }) => id === "major")?.anchor).toBe("start");
    expect(labels.find(({ id }) => id === "minor")?.anchor).not.toBe("start");
  });

  it("always labels the selected tradition, even when unimportant and crowded", () => {
    const markers = [marker("major", 100, 300, 200), marker("picked", 0, 300, 204)];

    const labels = genealogyLabelLayout(markers, options({ selectedId: "picked", transform: { ...identity, k: 0.3 } }));

    expect(labels.find(({ id }) => id === "picked")?.selected).toBe(true);
  });

  it("skips markers outside the usable viewport", () => {
    const markers = [
      marker("above-header", 100, 300, 20),
      marker("under-axis", 100, 10, 200),
      marker("right", 100, 1200, 200),
      marker("inside", 100, 300, 200),
    ];

    expect(ids(genealogyLabelLayout(markers, options()))).toEqual(["inside"]);
  });

  it("places labels in screen coordinates, beside the marker", () => {
    const transform = { k: 2, applyX: (x: number) => 2 * x + 10, applyY: (y: number) => 2 * y + 20 };

    const [label] = genealogyLabelLayout([marker("a", 100, 100, 100)], options({ transform, focusScale: 1 }));

    expect(label).toMatchObject({ x: 210 + 10 + 3, y: 220, anchor: "start" });
  });
});
