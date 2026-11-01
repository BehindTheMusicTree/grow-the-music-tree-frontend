import type { ZoomTransform } from "d3";
import type { Genealogy, GenealogyColumn } from "@schemas/api/genealogy";
import { AXIS_WIDTH, COLUMN_WIDTH, HEADER_HEIGHT, HEADER_ROW_HEIGHT } from "./geometry";

const MIN_LABEL_WIDTH = 64;
const LABEL_PADDING = 6;

type Props = {
  columns: Genealogy["columns"];
  regions: Genealogy["regions"];
  transform: ZoomTransform;
  width: number;
};

const columnLabel = ({ lanes }: GenealogyColumn) =>
  lanes.length > 1 ? `${lanes[0]!.label} +${lanes.length - 1}` : lanes[0]!.label;

const columnTitle = ({ lanes }: GenealogyColumn) => lanes.map(({ label }) => label).join(", ");

export default function GenealogyColumnHeader({ columns, regions, transform, width }: Props) {
  const cellWidth = COLUMN_WIDTH * transform.k;
  const showColumnLabels = cellWidth >= MIN_LABEL_WIDTH;
  const left = (position: number) => transform.applyX(AXIS_WIDTH + position * COLUMN_WIDTH);
  const right = width > 0 ? width : Infinity;
  const visible = (x: number, w: number) => x + w > AXIS_WIDTH && x < right;

  return (
    <g data-layer="column-header" pointerEvents="none">
      <rect x={0} y={0} width="100%" height={HEADER_HEIGHT} className="fill-white" />
      {regions.map((region, index) => {
        const x = left(region.startPosition);
        const w = (region.endPosition - region.startPosition + 1) * cellWidth;
        if (!visible(x, w)) return null;
        return (
          <svg key={`${region.id}:${region.startPosition}`} x={x} y={0} width={w} height={HEADER_ROW_HEIGHT}>
            <rect width="100%" height="100%" className={index % 2 === 0 ? "fill-slate-100" : "fill-slate-200"} />
            <text
              x={Math.max(0, AXIS_WIDTH - x) + LABEL_PADDING}
              y={HEADER_ROW_HEIGHT / 2}
              dominantBaseline="middle"
              className="fill-slate-700 text-[11px] font-semibold"
            >
              {region.label}
            </text>
          </svg>
        );
      })}
      {showColumnLabels &&
        columns.map((column) => {
          const x = left(column.position);
          if (!visible(x, cellWidth)) return null;
          return (
            <svg key={column.id} x={x} y={HEADER_ROW_HEIGHT} width={cellWidth} height={HEADER_ROW_HEIGHT}>
              <title>{columnTitle(column)}</title>
              <text
                x={LABEL_PADDING}
                y={HEADER_ROW_HEIGHT / 2}
                dominantBaseline="middle"
                className="fill-slate-600 text-[10px]"
              >
                {columnLabel(column)}
              </text>
            </svg>
          );
        })}
      <line x1={0} x2="100%" y1={HEADER_HEIGHT} y2={HEADER_HEIGHT} className="stroke-slate-300" />
    </g>
  );
}
