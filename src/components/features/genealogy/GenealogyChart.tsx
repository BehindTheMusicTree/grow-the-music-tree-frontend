"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { linkVertical, select, zoom, zoomIdentity, type ZoomTransform } from "d3";
import type { Genealogy, GenealogyLane, GenealogyTradition } from "@schemas/api/genealogy";
import { anchorPosition, AXIS_WIDTH, buildAnchorIndex, COLUMN_WIDTH, columnX, TOP_MARGIN } from "./geometry";
import { createYearScale, YEAR_MAX, YEAR_MIN, yearTicks } from "./yearScale";

const LANE_WIDTH = 8;
const MARKER_RADIUS = 5;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 6;
const ARROW_ID = "genealogy-arrow";

type Tooltip = { x: number; y: number; text: string };

const formatYear = (year: number | null) => (year === null ? "?" : year < 0 ? `${-year} BCE` : String(year));
const formatSpan = (start: number | null, end: number | null) => `${formatYear(start)} – ${formatYear(end)}`;

type Props = {
  data: Genealogy;
  onOpenInTree: (wikidataId: string) => void;
};

export default function GenealogyChart({ data, onOpenInTree }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const yearScale = useMemo(createYearScale, []);
  const ticks = useMemo(yearTicks, []);
  const anchors = useMemo(() => buildAnchorIndex(data), [data]);
  const lanes = useMemo(
    () =>
      new Map(
        data.columns.flatMap(({ position, lanes: columnLanes }) =>
          columnLanes.map((lane): [string, { position: number; lane: GenealogyLane }] => [lane.entityId, { position, lane }]),
        ),
      ),
    [data.columns],
  );
  const markers = useMemo(
    () =>
      data.traditions.flatMap((tradition) => {
        const year = tradition.start ?? tradition.end;
        if (tradition.anchorId === null || year === null) return [];
        const position = anchorPosition(anchors, tradition.anchorId, year);
        return position === null ? [] : [{ tradition, x: columnX(position), y: TOP_MARGIN + yearScale(year) }];
      }),
    [data.traditions, anchors, yearScale],
  );
  const markerById = useMemo(() => new Map(markers.map((marker) => [marker.tradition.wikidataId, marker])), [markers]);
  const unplacedCount = data.traditions.length - markers.length;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .on("zoom", (event: { transform: ZoomTransform }) => setTransform(event.transform));
    select(svg).call(behavior);
    return () => {
      select(svg).on(".zoom", null);
    };
  }, []);

  const showTooltip = (event: { clientX: number; clientY: number }, text: string) => {
    const box = svgRef.current?.getBoundingClientRect();
    setTooltip({ x: event.clientX - (box?.left ?? 0) + 12, y: event.clientY - (box?.top ?? 0) + 12, text });
  };
  const hideTooltip = () => setTooltip(null);

  const openTradition = ({ wikidataId, inCanonicalTree }: GenealogyTradition) => {
    if (inCanonicalTree) onOpenInTree(wikidataId);
  };
  const onMarkerKeyDown = (event: KeyboardEvent, tradition: GenealogyTradition) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openTradition(tradition);
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-white" data-testid="genealogy-chart">
      <svg
        ref={svgRef}
        className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        role="img"
        aria-label="Genealogy of music traditions"
      >
        <defs>
          <marker id={ARROW_ID} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-500" />
          </marker>
        </defs>

        <g transform={transform.toString()}>
          <g data-layer="fragments">
            {data.bands.map((band) => {
              const top = TOP_MARGIN + yearScale(band.startYear ?? YEAR_MIN);
              const bottom = TOP_MARGIN + yearScale(band.endYear ?? YEAR_MAX);
              return (
                <rect
                  key={`${band.entityId}:${band.fragment}`}
                  data-fragment={`${band.entityId}:${band.fragment}`}
                  x={AXIS_WIDTH + band.startPosition * COLUMN_WIDTH + 2}
                  y={top}
                  width={(band.endPosition - band.startPosition + 1) * COLUMN_WIDTH - 4}
                  height={Math.max(bottom - top, 1)}
                  rx={6}
                  className="fill-sky-100 stroke-sky-300"
                  onMouseMove={(event) => showTooltip(event, `${band.label} · ${formatSpan(band.startYear, band.endYear)}`)}
                  onMouseLeave={hideTooltip}
                />
              );
            })}
          </g>

          <g data-layer="lanes">
            {data.columns.flatMap(({ position, lanes: columnLanes }) =>
              columnLanes.map((lane) => {
                const top = TOP_MARGIN + yearScale(lane.startYear ?? YEAR_MIN);
                const bottom = TOP_MARGIN + yearScale(lane.endYear);
                return (
                  <rect
                    key={lane.entityId}
                    data-lane={lane.entityId}
                    x={columnX(position) - LANE_WIDTH / 2}
                    y={top}
                    width={LANE_WIDTH}
                    height={Math.max(bottom - top, 1)}
                    rx={3}
                    className="fill-slate-600"
                    onMouseMove={(event) => showTooltip(event, `${lane.label} · ${formatSpan(lane.startYear, lane.endYear)}`)}
                    onMouseLeave={hideTooltip}
                  />
                );
              }),
            )}
          </g>

          <g data-layer="successions" fill="none">
            {data.successions.map(({ predecessorId, successorId }) => {
              const from = lanes.get(predecessorId);
              const to = lanes.get(successorId);
              if (!from || !to) return null;
              const path = linkVertical()({
                source: [columnX(from.position), TOP_MARGIN + yearScale(from.lane.endYear)],
                target: [columnX(to.position), TOP_MARGIN + yearScale(to.lane.startYear ?? YEAR_MIN)],
              });
              return (
                <path
                  key={`${predecessorId}>${successorId}`}
                  data-succession={`${predecessorId}>${successorId}`}
                  d={path ?? undefined}
                  className="stroke-slate-500"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </g>

          <g data-layer="tradition-links" fill="none">
            {data.traditionLinks.map(({ sourceId, targetId, kind }) => {
              const source = markerById.get(sourceId);
              const target = markerById.get(targetId);
              if (!source || !target) return null;
              const isLineage = kind === "lineage";
              return (
                <line
                  key={`${sourceId}>${targetId}:${kind}`}
                  data-link={kind}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  className="stroke-slate-500"
                  strokeOpacity={0.6}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={isLineage ? undefined : "4 3"}
                  markerEnd={isLineage ? `url(#${ARROW_ID})` : undefined}
                />
              );
            })}
          </g>

          <g data-layer="traditions">
            {markers.map(({ tradition, x, y }) => {
              const canOpen = tradition.inCanonicalTree;
              return (
                <circle
                  key={tradition.wikidataId}
                  data-tradition={tradition.wikidataId}
                  data-in-tree={canOpen}
                  cx={x}
                  cy={y}
                  r={MARKER_RADIUS}
                  className={canOpen ? "cursor-pointer fill-emerald-600 stroke-white" : "fill-amber-500 stroke-white"}
                  role={canOpen ? "link" : undefined}
                  tabIndex={canOpen ? 0 : undefined}
                  aria-label={canOpen ? `${tradition.label}, open in the genre tree` : undefined}
                  onClick={() => openTradition(tradition)}
                  onKeyDown={(event) => onMarkerKeyDown(event, tradition)}
                  onMouseMove={(event) =>
                    showTooltip(event, `${tradition.label} · ${formatSpan(tradition.start, tradition.end)}`)
                  }
                  onMouseLeave={hideTooltip}
                />
              );
            })}
          </g>
        </g>

        <g data-layer="year-axis" pointerEvents="none">
          <rect x={0} y={0} width={AXIS_WIDTH} height="100%" className="fill-white" />
          {ticks.map((year) => (
            <text
              key={year}
              x={AXIS_WIDTH - 8}
              y={transform.applyY(TOP_MARGIN + yearScale(year))}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-600 text-[11px]"
            >
              {formatYear(year)}
            </text>
          ))}
        </g>
      </svg>

      {unplacedCount > 0 && (
        <p className="pointer-events-none absolute bottom-2 right-3 rounded bg-white/90 px-2 py-1 text-xs text-slate-600">
          {unplacedCount} traditions without a place are not shown
        </p>
      )}
      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 max-w-xs rounded bg-slate-900 px-2 py-1 text-xs text-white shadow"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
