import type { ZoomTransform } from "d3";
import type { Genealogy, GenealogyColumn } from "@schemas/api/genealogy";
import { AXIS_WIDTH, COLUMN_WIDTH, HEADER_ROW_HEIGHT, headerHeight, showsColumnLabels } from "./geometry";

// Rough glyph width of the 11px semibold region labels, to drop a label its cell cannot hold.
const REGION_CHAR_WIDTH = 7;
const REGION_LABEL_INSET = 8;

type Props = {
  columns: Genealogy["columns"];
  regions: Genealogy["regions"];
  transform: ZoomTransform;
  width: number;
  /** Height of the band above the labels, kept clear for the floating app header. */
  top: number;
};

const columnLabel = ({ lanes }: GenealogyColumn) =>
  lanes.length > 1 ? `${lanes[0]!.label} +${lanes.length - 1}` : lanes[0]!.label;

const columnTitle = ({ lanes }: GenealogyColumn) => lanes.map(({ label }) => label).join(", ");

export default function GenealogyColumnHeader({ columns, regions, transform, width, top }: Props) {
  const cellWidth = COLUMN_WIDTH * transform.k;
  const showColumnLabels = showsColumnLabels(transform.k);
  const left = (position: number) => transform.applyX(AXIS_WIDTH + position * COLUMN_WIDTH);
  const right = width > 0 ? width : Infinity;
  const visible = (x: number, w: number) => x + w > AXIS_WIDTH && x < right;
  // Centre of the cell's on-screen part, so a label stays readable while its cell is panned partly out.
  const centre = (x: number, w: number) => (Math.max(x, AXIS_WIDTH) + Math.min(x + w, right)) / 2 - x;
  const regionHeight = top + HEADER_ROW_HEIGHT;
  const bottom = top + headerHeight(transform.k);

  return (
    <g data-layer="column-header" pointerEvents="none">
      <rect x={0} y={0} width="100%" height={bottom} className="fill-white" />
      {regions.map((region, index) => {
        const x = left(region.startPosition);
        const w = (region.endPosition - region.startPosition + 1) * cellWidth;
        if (!visible(x, w)) return null;
        const visibleWidth = Math.min(x + w, right) - Math.max(x, AXIS_WIDTH);
        const fits = region.label.length * REGION_CHAR_WIDTH + 2 * REGION_LABEL_INSET <= visibleWidth;
        return (
          <svg key={`${region.id}:${region.startPosition}`} x={x} y={0} width={w} height={regionHeight}>
            <rect width="100%" height="100%" className={index % 2 === 0 ? "fill-slate-100" : "fill-slate-200"} />
            {fits && (
              <text
                x={centre(x, w)}
                y={top + HEADER_ROW_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-700 text-[11px] font-semibold"
              >
                {region.label}
              </text>
            )}
          </svg>
        );
      })}
      {showColumnLabels &&
        columns.map((column) => {
          const x = left(column.position);
          if (!visible(x, cellWidth)) return null;
          return (
            <svg key={column.id} x={x} y={regionHeight} width={cellWidth} height={HEADER_ROW_HEIGHT}>
              <title>{columnTitle(column)}</title>
              <text
                x={cellWidth / 2}
                y={HEADER_ROW_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-600 text-[10px]"
              >
                {columnLabel(column)}
              </text>
            </svg>
          );
        })}
      <line x1={0} x2="100%" y1={bottom} y2={bottom} className="stroke-slate-300" />
    </g>
  );
}
