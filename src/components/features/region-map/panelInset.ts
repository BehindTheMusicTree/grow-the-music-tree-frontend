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
  if (panel.dataset.sheet === "true" && window.matchMedia(SHEET_QUERY).matches) {
    return { bottom: Math.max(0, Math.round(scopeRect.bottom - panelRect.top)) };
  }
  if (panel.dataset.side === "right") {
    return { right: Math.max(0, Math.round(scopeRect.right - panelRect.left)) };
  }
  return { left: Math.max(0, Math.round(panelRect.right - scopeRect.left)) };
}

export function fitPadding(base: number, inset: PanelInset) {
  return {
    top: base,
    bottom: base + (inset.bottom ?? 0),
    left: base + (inset.left ?? 0),
    right: base + (inset.right ?? 0),
  };
}
