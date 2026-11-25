const SHEET_QUERY = "(max-width: 47.999rem)";

export interface PanelInset {
  left?: number;
  right?: number;
  bottom?: number;
}

/** Space the detail panel hides over the map, mirroring the UI package's obscured-inset rules. */
export function measurePanelInset(container: HTMLElement): PanelInset {
  // The map div sits in the canvas root; the panel is a sibling of that root.
  const scope = container.parentElement?.parentElement;
  const panel = scope?.querySelector<HTMLElement>("[data-detail-panel]");
  if (!scope || !panel || panel.dataset.collapsed === "true") return {};
  const panelRect = panel.getBoundingClientRect();
  const scopeRect = scope.getBoundingClientRect();
  if (window.getComputedStyle(panel).getPropertyValue("--detail-panel-obscured-edge").trim() === "left") {
    return { left: Math.max(0, Math.round(panelRect.right - scopeRect.left)) };
  }
  if (panel.dataset.sheet === "true" && window.matchMedia(SHEET_QUERY).matches) {
    return { bottom: Math.max(0, Math.round(scopeRect.bottom - panelRect.top)) };
  }
  if (panel.dataset.side === "right") {
    return { right: Math.max(0, Math.round(scopeRect.right - panelRect.left)) };
  }
  return { left: Math.max(0, Math.round(panelRect.right - scopeRect.left)) };
}

// MapLibre leaves the camera untouched when the padding leaves no room, so keep at least a third of each axis.
export function fitPadding(base: number, inset: PanelInset, size?: { width: number; height: number }) {
  const cap = (value: number | undefined, axis: number | undefined) =>
    axis === undefined ? (value ?? 0) : Math.min(value ?? 0, Math.max(0, Math.floor((axis * 2) / 3) - 2 * base));
  return {
    top: base,
    bottom: base + cap(inset.bottom, size?.height),
    left: base + cap(inset.left, size?.width),
    right: base + cap(inset.right, size?.width),
  };
}

/** Padding for a fit on `container`; an unmeasured (0×0) container is not capped. */
export function containerFitPadding(base: number, container: HTMLElement) {
  const { clientWidth: width, clientHeight: height } = container;
  return fitPadding(base, measurePanelInset(container), width > 0 && height > 0 ? { width, height } : undefined);
}
