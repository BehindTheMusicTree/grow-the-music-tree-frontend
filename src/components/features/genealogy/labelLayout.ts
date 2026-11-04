import {
  dotLabelCandidates,
  isRankShownAtZoom,
  logScalePosition,
  placeLabels,
  type Box,
  type LabelPlacementItem,
  type ValueRange,
} from "@behindthemusictree/ui";
import { AXIS_WIDTH } from "./geometry";

export const LABEL_MIN_FONT_SIZE = 11;
export const LABEL_MAX_FONT_SIZE = 18;
// At the lowest zoom only the top 40% of traditions (by rank) are labelled.
export const LABEL_MIN_RANK_AT_MIN_ZOOM = 0.6;
const LABEL_DOT_GAP = 3;
// Past this margin a marker cannot influence the labels on screen.
const OFFSCREEN_MARGIN = 80;

export type LabelMarker = {
  id: string;
  label: string;
  sitelinks: number;
  /** Chart coordinates, before the zoom transform. */
  x: number;
  y: number;
  /** Marker radius in chart units. */
  radius: number;
};

export type LabelTransform = {
  k: number;
  applyX: (x: number) => number;
  applyY: (y: number) => number;
};

export type PlacedLabel = {
  id: string;
  text: string;
  /** Screen coordinates of the text anchor. */
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  fontSize: number;
  selected: boolean;
};

export type LabelLayoutOptions = {
  transform: LabelTransform;
  viewport: { width: number; height: number };
  /** Screen y below which labels may appear (the column header is drawn above). */
  headerBottom: number;
  selectedId: string | null;
  sitelinksRange: ValueRange;
  minScale: number;
  focusScale: number;
};

export function sitelinksRange(markers: LabelMarker[]): ValueRange {
  const counts = markers.map(({ sitelinks }) => sitelinks);
  return { min: Math.min(...counts), max: Math.max(...counts) };
}

/** Labels to draw for the markers on screen: more important traditions get larger text and appear at lower zoom;
 * colliding labels lose to the more important one, and the selected tradition is always labelled. */
export function genealogyLabelLayout(
  markers: LabelMarker[],
  { transform, viewport, headerBottom, selectedId, sitelinksRange: range, minScale, focusScale }: LabelLayoutOptions,
): PlacedLabel[] {
  const zoomOptions = { minScale, focusScale, minRankAtMinZoom: LABEL_MIN_RANK_AT_MIN_ZOOM };
  const items: LabelPlacementItem[] = [];
  const meta = new Map<string, { marker: LabelMarker; fontSize: number; cx: number; cy: number; candidates: ReturnType<typeof dotLabelCandidates> }>();

  for (const marker of markers) {
    const cx = transform.applyX(marker.x);
    const cy = transform.applyY(marker.y);
    const selected = marker.id === selectedId;
    const inView =
      cx >= AXIS_WIDTH - OFFSCREEN_MARGIN &&
      cx <= viewport.width + OFFSCREEN_MARGIN &&
      cy >= headerBottom - OFFSCREEN_MARGIN &&
      cy <= viewport.height + OFFSCREEN_MARGIN;
    if (!inView) continue;

    const radius = marker.radius * transform.k;
    const rank = logScalePosition(marker.sitelinks, range);
    const fontSize = LABEL_MIN_FONT_SIZE + rank * (LABEL_MAX_FONT_SIZE - LABEL_MIN_FONT_SIZE);
    const onScreen = cx >= AXIS_WIDTH && cx <= viewport.width && cy >= headerBottom && cy <= viewport.height;
    const eligible = onScreen && (selected || isRankShownAtZoom(rank, transform.k, zoomOptions));
    const candidates = eligible ? dotLabelCandidates(marker.label, radius, fontSize, { gap: LABEL_DOT_GAP, preferRight: true }) : [];
    const labels: Box[] = candidates.map(({ box }) => ({ x0: cx + box.x0, x1: cx + box.x1, y0: cy + box.y0, y1: cy + box.y1 }));

    items.push({
      id: marker.id,
      labels,
      dot: { x0: cx - radius, x1: cx + radius, y0: cy - radius, y1: cy + radius },
      priority: selected ? Number.POSITIVE_INFINITY : rank,
      forced: selected,
    });
    meta.set(marker.id, { marker, fontSize, cx, cy, candidates });
  }

  const placement = placeLabels(items);
  const placed: PlacedLabel[] = [];
  for (const [id, index] of Array.from(placement)) {
    if (index < 0) continue;
    const { marker, fontSize, cx, cy, candidates } = meta.get(id)!;
    const candidate = candidates[index]!;
    placed.push({
      id,
      text: marker.label,
      x: cx + candidate.x,
      y: cy + candidate.y,
      anchor: candidate.anchor,
      fontSize,
      selected: id === selectedId,
    });
  }
  return placed;
}
