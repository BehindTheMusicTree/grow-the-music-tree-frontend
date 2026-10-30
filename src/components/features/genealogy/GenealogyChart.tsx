"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { linkVertical, select, zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3";
import { ZoomControls } from "@behindthemusictree/ui";
import type { Genealogy, GenealogyLane, GenealogyTradition } from "@schemas/api/genealogy";
import { formatSpan, formatYear } from "./format";
import { anchorPosition, AXIS_WIDTH, buildAnchorIndex, COLUMN_WIDTH, columnX, TOP_MARGIN } from "./geometry";
import { createYearScale, YEAR_MAX, YEAR_MIN, yearTicks } from "./yearScale";

const LANE_WIDTH = 8;
const MARKER_RADIUS = 5;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 6;
const ARROW_ID = "genealogy-arrow";

type Tooltip = { x: number; y: number; text: string };

const ZOOM_STEP = 1.4;
const ZOOM_DURATION = 200;
const FIT_PADDING = 24;

type Props = {
  data: Genealogy;
  selectedId: string | null;
  onSelect: (wikidataId: string) => void;
};

export default function GenealogyChart({ data, selectedId, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const behaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const fittedRef = useRef(false);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [minZoom, setMinZoom] = useState(MIN_ZOOM);
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

  const fit = useCallback(
    (animate: boolean) => {
      const svg = svgRef.current;
      const behavior = behaviorRef.current;
      if (!svg || !behavior || svg.clientWidth === 0 || svg.clientHeight === 0) return false;
      const lastPosition = Math.max(
        ...data.columns.map(({ position }) => position),
        ...data.bands.map(({ endPosition }) => endPosition),
      );
      const x0 = AXIS_WIDTH;
      const x1 = columnX(lastPosition) + COLUMN_WIDTH / 2;
      const y0 = TOP_MARGIN;
      const y1 = TOP_MARGIN + yearScale(YEAR_MAX);
      const availableWidth = svg.clientWidth - AXIS_WIDTH - 2 * FIT_PADDING;
      const availableHeight = svg.clientHeight - 2 * FIT_PADDING;
      const k = Math.min(availableWidth / (x1 - x0), availableHeight / (y1 - y0));
      const next = zoomIdentity
        .translate(
          AXIS_WIDTH + FIT_PADDING + (availableWidth - k * (x1 - x0)) / 2 - k * x0,
          FIT_PADDING + (availableHeight - k * (y1 - y0)) / 2 - k * y0,
        )
        .scale(k);
      const floor = Math.min(MIN_ZOOM, k);
      behavior.scaleExtent([floor, MAX_ZOOM]);
      setMinZoom(floor);
      const selection = select(svg);
      if (animate) selection.transition().duration(ZOOM_DURATION).call(behavior.transform, next);
      else selection.call(behavior.transform, next);
      return true;
    },
    [data.columns, data.bands, yearScale],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .on("zoom", (event: { transform: ZoomTransform }) => setTransform(event.transform));
    behaviorRef.current = behavior;
    select(svg).call(behavior);
    return () => {
      select(svg).on(".zoom", null);
      behaviorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const fitOnce = () => {
      if (!fittedRef.current && fit(false)) fittedRef.current = true;
    };
    fitOnce();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(fitOnce);
    observer.observe(svg);
    return () => observer.disconnect();
  }, [fit]);

  const zoomBy = (factor: number) => {
    const svg = svgRef.current;
    const behavior = behaviorRef.current;
    if (svg && behavior) select(svg).transition().duration(ZOOM_DURATION).call(behavior.scaleBy, factor);
  };

  const showTooltip = (event: { clientX: number; clientY: number }, text: string) => {
    const box = svgRef.current?.getBoundingClientRect();
    setTooltip({ x: event.clientX - (box?.left ?? 0) + 12, y: event.clientY - (box?.top ?? 0) + 12, text });
  };
  const hideTooltip = () => setTooltip(null);

  const onMarkerKeyDown = (event: KeyboardEvent, { wikidataId }: GenealogyTradition) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect(wikidataId);
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
              const selected = tradition.wikidataId === selectedId;
              return (
                <circle
                  key={tradition.wikidataId}
                  data-tradition={tradition.wikidataId}
                  data-in-tree={tradition.inCanonicalTree}
                  cx={x}
                  cy={y}
                  r={selected ? MARKER_RADIUS + 2 : MARKER_RADIUS}
                  strokeWidth={selected ? 2 : 1}
                  className={`cursor-pointer ${tradition.inCanonicalTree ? "fill-emerald-600" : "fill-amber-500"} ${selected ? "stroke-slate-900" : "stroke-white"}`}
                  role="button"
                  tabIndex={0}
                  aria-label={tradition.label}
                  aria-pressed={selected}
                  onClick={() => onSelect(tradition.wikidataId)}
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
        <p className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded bg-white/90 px-2 py-1 text-xs text-slate-600 shadow">
          {unplacedCount} traditions without a place are not shown
        </p>
      )}
      <ZoomControls
        className="absolute bottom-3 right-3 z-10"
        onZoomIn={() => zoomBy(ZOOM_STEP)}
        onZoomOut={() => zoomBy(1 / ZOOM_STEP)}
        onFit={() => fit(true)}
        canZoomIn={transform.k < MAX_ZOOM}
        canZoomOut={transform.k > minZoom}
      />
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
