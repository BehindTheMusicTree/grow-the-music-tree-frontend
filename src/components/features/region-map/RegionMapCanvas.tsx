"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addProtocol,
  Map as MapLibreMap,
  setWorkerUrl,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useHoverTooltip } from "@hooks/useHoverTooltip";
import { publicEnv } from "@lib/env";
import type { Region } from "@schemas/api/region-map";
import {
  buildStyle,
  CITY_LABEL_LAYER,
  CITY_LAYER,
  cityRadius,
  depthColors,
  describe,
  fillColorExpression,
  idFilter,
  MAX_ZOOM,
  REGION_FILL_LAYER,
  REGION_HIT_LAYER,
  REGION_LABEL_LAYER,
  REGION_SELECTED_LAYER,
  REGIONS_SOURCE_LAYER,
  regionBounds,
  TILES_SOURCE,
  ZONE_FILL_LAYER,
  ZONE_LABEL_LAYER,
  ZONE_LINE_LAYER,
  zoneLineFilter,
} from "./regionMapLayers";
import type { Camera } from "./useRegionMapUrlState";

/** Asks the map to fly to a region, or to the world when `id` is null; `seq` makes a repeated request a new one. */
export type FocusRequest = { id: string | null; seq: number };

type Props = {
  /** sha256 of the vector tileset (`regions/<sha256>.pmtiles` in the tiles bucket), from the index; immutable per content hash. */
  tileset: string;
  regions: ReadonlyMap<string, Region>;
  /** Top-level admin regions, the roots of the region list shown when the map cannot render. */
  rootIds: readonly string[];
  selectedId: string | null;
  zoneId: string | null;
  /** Where the map opens; without it the map opens on the region of `focus`, or the world. */
  initialCamera: Camera | null;
  /** Each new `seq` flies to a region; the request present at mount frames the opening view instead. */
  focus: FocusRequest | null;
  onRegionClick: (region: Region) => void;
  onClearSelection: () => void;
  onCameraChange: (camera: Camera) => void;
};

const TOOLTIP_OFFSET = 12;
const ON_GLOBE_TOLERANCE_PX = 1;
const FIT_PADDING = 24;
const TILES_BASE_URL = publicEnv.NEXT_PUBLIC_TILES_BASE_URL;
const regionState = (id: string) => ({ source: TILES_SOURCE, sourceLayer: REGIONS_SOURCE_LAYER, id });

addProtocol("pmtiles", new Protocol().tile);

// MapLibre 6 locates its worker from `import.meta.url`, which a bundler rewrites, so the worker must be emitted explicitly.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

// A label can overflow its region onto the sea: it must hover and select like the fill.
const HIT_LAYERS = [
  REGION_HIT_LAYER,
  REGION_FILL_LAYER,
  REGION_LABEL_LAYER,
  ZONE_LABEL_LAYER,
  CITY_LAYER,
  CITY_LABEL_LAYER,
];
// A zone or city is only reachable through its label or dot, drawn over the regions it lies on.
const POINT_LAYERS = new Set([ZONE_LABEL_LAYER, CITY_LAYER, CITY_LABEL_LAYER]);
const LISTED_LAYERS = [REGION_FILL_LAYER, ZONE_LABEL_LAYER, CITY_LAYER];

/** The feature under the pointer: a zone or city label first, else the deepest region, the one drawn on top. */
export function pickFeatureId(features: readonly Pick<MapGeoJSONFeature, "properties" | "layer">[]): string | undefined {
  const point = features.find((feature) => POINT_LAYERS.has(feature.layer.id));
  const picked =
    point ??
    features.reduce<(typeof features)[number] | undefined>(
      (deepest, feature) =>
        deepest === undefined || Number(feature.properties.depth ?? 0) > Number(deepest.properties.depth ?? 0)
          ? feature
          : deepest,
      undefined,
    );
  const id = picked?.properties.id;
  return typeof id === "string" ? id : undefined;
}

const byName = (a: Region, b: Region) => a.name.localeCompare(b.name);

export default function RegionMapCanvas({
  tileset,
  regions,
  rootIds,
  selectedId,
  zoneId,
  initialCamera,
  focus,
  onRegionClick,
  onClearSelection,
  onCameraChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const regionsRef = useRef(regions);
  const onClickRef = useRef(onRegionClick);
  const onClearRef = useRef(onClearSelection);
  const onCameraRef = useRef(onCameraChange);
  const initialRef = useRef({ initialCamera, selectedId, zoneId, focus });
  const focusSeqRef = useRef(focus?.seq);
  const hoveredRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [visibleIds, setVisibleIds] = useState<readonly string[]>([]);
  const { text: tooltipText, ref: tooltipRef, show: showTooltip, hide: hideTooltip } = useHoverTooltip();

  useEffect(() => {
    regionsRef.current = regions;
    onClickRef.current = onRegionClick;
    onClearRef.current = onClearSelection;
    onCameraRef.current = onCameraChange;
  });

  const colors = useMemo(() => depthColors(regions), [regions]);
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const { initialCamera: camera, selectedId: initialSelected, zoneId: initialZone, focus: initialFocus } = initialRef.current;
    const opening = initialFocus?.id == null ? undefined : regionsRef.current.get(initialFocus.id);
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        style: buildStyle({
          tilesetUrl: `${TILES_BASE_URL}/regions/${tileset}.pmtiles`,
          glyphsUrl: `${TILES_BASE_URL}/fonts/{fontstack}/{range}.pbf`,
          zoneId: initialZone,
          selectedId: initialSelected,
          colors: colorsRef.current,
        }),
        ...(camera
          ? { center: [camera.lng, camera.lat] as [number, number], zoom: camera.zoom }
          : { bounds: regionBounds(opening, regionsRef.current), fitBoundsOptions: { padding: FIT_PADDING, maxZoom: MAX_ZOOM } }),
        maxZoom: MAX_ZOOM,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: false,
      });
    } catch {
      setWebglFailed(true);
      return;
    }
    mapRef.current = map;
    // Overrides MapLibre's grab/grabbing container cursor: background shows the arrow, regions the pointer.
    map.getCanvas().style.cursor = "default";

    const setHover = (id: string | null) => {
      if (hoveredRef.current === id) return;
      if (hoveredRef.current !== null) map.setFeatureState(regionState(hoveredRef.current), { hover: false });
      if (id !== null) map.setFeatureState(regionState(id), { hover: true });
      hoveredRef.current = id;
    };
    const isOnGlobe = (point: { x: number; y: number }) => {
      const back = map.project(map.unproject([point.x, point.y]));
      return Math.hypot(back.x - point.x, back.y - point.y) <= ON_GLOBE_TOLERANCE_PX;
    };
    const regionAt = (event: MapLayerMouseEvent) => {
      // On the globe, MapLibre snaps a point in space to the nearest point of the sphere, so the
      // layer events report the region on the horizon all along the ray out to the viewport edge.
      // Such a point does not round-trip through unproject/project back onto itself.
      if (!isOnGlobe(event.point)) return undefined;
      const id = pickFeatureId(event.features ?? []);
      return id === undefined ? undefined : regionsRef.current.get(id);
    };
    const clearHover = () => {
      setHover(null);
      map.getCanvas().style.cursor = "default";
      hideTooltip();
    };
    const listVisible = () => {
      const ids = new Set<string>();
      for (const feature of map.queryRenderedFeatures({ layers: LISTED_LAYERS })) {
        const id = feature.properties.id;
        if (typeof id === "string") ids.add(id);
      }
      const next = Array.from(ids).sort();
      setVisibleIds((current) => (current.join() === next.join() ? current : next));
    };

    map.on("load", () => setReady(true));
    map.on("idle", listVisible);
    map.on("moveend", () => {
      const { lng, lat } = map.getCenter();
      onCameraRef.current({ lng, lat, zoom: map.getZoom() });
    });
    map.on("click", HIT_LAYERS, (event) => {
      const region = regionAt(event);
      if (region) onClickRef.current(region);
    });
    // Layer handlers only fire over a feature: a click on the ocean or off the globe clears the selection.
    map.on("click", (event) => {
      const features = map.queryRenderedFeatures(event.point, { layers: HIT_LAYERS });
      if (!isOnGlobe(event.point) || features.length === 0) onClearRef.current();
    });
    map.on("mousemove", HIT_LAYERS, (event) => {
      const region = regionAt(event);
      if (!region) {
        clearHover();
        return;
      }
      setHover(region.kind === "zone" || region.kind === "city" ? null : region.id);
      map.getCanvas().style.cursor = "pointer";
      showTooltip(event.point.x + TOOLTIP_OFFSET, event.point.y + TOOLTIP_OFFSET, describe(region));
    });
    map.on("mouseleave", HIT_LAYERS, clearHover);

    return () => {
      map.remove();
      mapRef.current = null;
      hoveredRef.current = null;
      setReady(false);
    };
  }, [tileset, showTooltip, hideTooltip]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setPaintProperty(REGION_FILL_LAYER, "fill-color", fillColorExpression(colors));
  }, [ready, colors]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setFilter(ZONE_FILL_LAYER, idFilter(zoneId));
    map.setFilter(ZONE_LINE_LAYER, zoneLineFilter(zoneId));
  }, [ready, zoneId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setFilter(REGION_SELECTED_LAYER, idFilter(selectedId));
    map.setPaintProperty(CITY_LAYER, "circle-radius", cityRadius(selectedId));
  }, [ready, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || focus === null || focus.seq === focusSeqRef.current) return;
    focusSeqRef.current = focus.seq;
    const region = focus.id === null ? undefined : regionsRef.current.get(focus.id);
    map.fitBounds(regionBounds(region, regionsRef.current), { padding: FIT_PADDING, maxZoom: MAX_ZOOM });
  }, [ready, focus]);

  const listed = useMemo(
    () =>
      visibleIds
        .flatMap((id) => regions.get(id) ?? [])
        .sort(byName),
    [visibleIds, regions],
  );

  const onFocusRegion = (region: Region) => {
    const map = mapRef.current;
    if (!map) return;
    // Feature state throws until the style has loaded.
    if (ready && region.kind !== "zone" && region.kind !== "city") {
      if (hoveredRef.current !== null && hoveredRef.current !== region.id) {
        map.setFeatureState(regionState(hoveredRef.current), { hover: false });
      }
      map.setFeatureState(regionState(region.id), { hover: true });
      hoveredRef.current = region.id;
    }
    const point = map.project(region.centroid);
    showTooltip(point.x + TOOLTIP_OFFSET, point.y + TOOLTIP_OFFSET, describe(region));
  };
  const onBlurRegion = (region: Region) => {
    if (ready && hoveredRef.current === region.id) {
      mapRef.current?.setFeatureState(regionState(region.id), { hover: false });
    }
    hoveredRef.current = null;
    hideTooltip();
  };

  const regionButton = (region: Region, withMapFeedback: boolean) => (
    <button
      type="button"
      aria-label={describe(region)}
      aria-pressed={selectedId === region.id}
      onClick={() => onRegionClick(region)}
      onFocus={withMapFeedback ? () => onFocusRegion(region) : undefined}
      onBlur={withMapFeedback ? () => onBlurRegion(region) : undefined}
      className="w-full rounded px-2 py-1 text-left hover:bg-gray-100 focus-visible:outline focus-visible:outline-2"
    >
      {region.name}
    </button>
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg" role="group" aria-label="Region map">
      {!webglFailed && <div ref={containerRef} className="h-full w-full" />}
      {webglFailed ? (
        <>
          <p role="alert" className="bg-white p-3 text-sm text-red-600">
            The map cannot be displayed on this device. Use the region list instead.
          </p>
          <RegionTree ids={rootIds} regions={regions} renderButton={(region) => regionButton(region, false)} />
        </>
      ) : (
        <ul
          aria-label="Regions on the map"
          className="sr-only text-sm focus-within:not-sr-only focus-within:absolute focus-within:left-2 focus-within:top-2 focus-within:max-h-64 focus-within:overflow-y-auto focus-within:rounded focus-within:bg-white focus-within:p-1"
        >
          {listed.map((region) => (
            <li key={region.id}>{regionButton(region, true)}</li>
          ))}
        </ul>
      )}
      {tooltipText !== null && (
        <div
          ref={tooltipRef}
          aria-hidden
          data-tooltip
          className="pointer-events-none absolute rounded bg-black/80 px-2 py-1 text-sm text-white"
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
}

type TreeProps = {
  ids: readonly string[];
  regions: ReadonlyMap<string, Region>;
  renderButton: (region: Region) => React.ReactNode;
};

/** The admin hierarchy as nested lists, for a device that cannot draw the map. */
function RegionTree({ ids, regions, renderButton }: TreeProps) {
  const level = ids.flatMap((id) => regions.get(id) ?? []).sort(byName);
  if (level.length === 0) return null;
  return (
    <ul className="max-h-64 overflow-y-auto bg-white p-1 text-sm">
      {level.map((region) => (
        <li key={region.id}>
          {renderButton(region)}
          {region.childIds.length > 0 && (
            <details className="pl-4">
              <summary className="cursor-pointer px-2 py-1 text-gray-600">Subdivisions of {region.name}</summary>
              <RegionTree ids={region.childIds} regions={regions} renderButton={renderButton} />
            </details>
          )}
        </li>
      ))}
    </ul>
  );
}
