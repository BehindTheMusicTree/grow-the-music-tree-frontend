/** Edge tab that hides a panel and brings it back, for panels that have no expanded mode. */
export function collapseEdgeTab(collapsed: boolean, onCollapsedChange: (collapsed: boolean) => void) {
  return collapsed
    ? { edge: null, center: { label: "Show panel", onClick: () => onCollapsedChange(false) } }
    : { edge: { label: "Hide panel", onClick: () => onCollapsedChange(true) }, center: null };
}
