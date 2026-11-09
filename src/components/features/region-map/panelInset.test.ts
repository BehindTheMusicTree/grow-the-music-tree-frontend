import { afterEach, describe, expect, it, vi } from "vitest";

import { fitPadding, measurePanelInset } from "./panelInset";

function rect(r: Partial<DOMRect>): DOMRect {
  return { left: 0, top: 0, right: 0, bottom: 0, ...r } as DOMRect;
}

function setup(data: Record<string, string>, panelRect: Partial<DOMRect>) {
  const scope = document.createElement("div");
  const map = document.createElement("div");
  const panel = document.createElement("aside");
  panel.setAttribute("data-detail-panel", "");
  Object.entries(data).forEach(([k, v]) => panel.setAttribute(`data-${k}`, v));
  const canvasRoot = document.createElement("div");
  canvasRoot.append(map);
  scope.append(canvasRoot, panel);
  vi.spyOn(scope, "getBoundingClientRect").mockReturnValue(rect({ left: 10, right: 1010, top: 0, bottom: 600 }));
  vi.spyOn(panel, "getBoundingClientRect").mockReturnValue(rect(panelRect));
  return map;
}

function mockMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({ matches }));
}

describe("measurePanelInset", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns nothing without a panel", () => {
    const scope = document.createElement("div");
    const canvasRoot = document.createElement("div");
    const map = document.createElement("div");
    canvasRoot.append(map);
    scope.append(canvasRoot);
    expect(measurePanelInset(map)).toEqual({});
  });

  it("returns nothing when collapsed", () => {
    mockMedia(false);
    expect(measurePanelInset(setup({ collapsed: "true" }, { right: 400 }))).toEqual({});
  });

  it("returns the left inset for a left panel", () => {
    mockMedia(false);
    expect(measurePanelInset(setup({ collapsed: "false", side: "left" }, { right: 410 }))).toEqual({ left: 400 });
  });

  it("returns the right inset for a right panel", () => {
    mockMedia(false);
    expect(measurePanelInset(setup({ side: "right" }, { left: 700 }))).toEqual({ right: 310 });
  });

  it("returns the bottom inset for a narrow sheet", () => {
    mockMedia(true);
    expect(measurePanelInset(setup({ sheet: "true", side: "left" }, { top: 350 }))).toEqual({ bottom: 250 });
  });
});

describe("fitPadding", () => {
  it("adds the inset to the matching side", () => {
    expect(fitPadding(24, { left: 400 })).toEqual({ top: 24, bottom: 24, left: 424, right: 24 });
  });

  it("caps the inset so a third of the map stays visible", () => {
    expect(fitPadding(24, { left: 900 }, { width: 600, height: 400 })).toEqual({ top: 24, bottom: 24, left: 376, right: 24 });
  });
});
