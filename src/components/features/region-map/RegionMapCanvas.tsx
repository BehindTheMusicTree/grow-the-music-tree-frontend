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
  backdropColors,
  backdropFilter,
  depthColors,
  EMPTY_FILL,
  describe,
  fillColorExpression,
  idFilter,
  MAX_ZOOM,
  REGION_BACKDROP_LAYER,
  REGION_FILL_LAYER,
  REGION_HIT_LAYER,
  REGION_LABEL_LAYER,
  REGION_SELECTED_LAYER,
  REGIONS_SOURCE_LAYER,
  regionBounds,
  MOON_LAYER,
  STARFIELD_LAYER,
  TILES_SOURCE,
  ZONE_FILL_LAYER,
  ZONE_GLOW_LAYER,
  ZONE_LABEL_LAYER,
  ZONE_LINE_LAYER,
  ZONE_SUPRA_SELECTED_LAYER,
  zoneFilters,
  focusIds,
  greyed,
  zoneColor,
  supranationalZoneIds,
} from "./regionMapLayers";
import { containerFitPadding } from "./panelInset";
import { createMoonLayer } from "./moonLayer";
import { createNightLayer } from "./nightLayer";
import { createStarfieldLayer } from "./starfieldLayer";
import { createSunLayer } from "./sunLayer";
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
const featureState = (region: Pick<Region, "id" | "kind">) => ({
  source: TILES_SOURCE,
  sourceLayer: region.kind === "zone" ? "zones" : REGIONS_SOURCE_LAYER,
  id: region.id,
});

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
export function pickFeatureId(
  features: readonly Pick<MapGeoJSONFeature, "properties" | "layer">[],
): string | undefined {
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
  const hoveredRef = useRef<Region | null>(null);
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

  const depth = useMemo(() => depthColors(regions), [regions]);
  const focused = useMemo(() => focusIds(selectedId, regions), [selectedId, regions]);
  const colors = useMemo(() => (focused === null ? depth : greyed(depth, focused)), [focused, depth]);
  const supranationalIds = useMemo(() => supranationalZoneIds(regions), [regions]);
  const supranationalRef = useRef(supranationalIds);
  supranationalRef.current = supranationalIds;
  const colorsRef = useRef(colors);
  colorsRef.current = colors;
  const lit = useMemo(() => backdropColors(regions), [regions]);
  const backdrop = useMemo(() => (focused === null ? lit : greyed(lit, focused)), [focused, lit]);
  const backdropRef = useRef(backdrop);
  backdropRef.current = backdrop;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const {
      initialCamera: camera,
      selectedId: initialSelected,
      zoneId: initialZone,
      focus: initialFocus,
    } = initialRef.current;
    const opening = initialFocus?.id == null ? undefined : regionsRef.current.get(initialFocus.id);
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        style: buildStyle({
          tilesetUrl: `${TILES_BASE_URL}/regions/${tileset}.pmtiles`,
          glyphsUrl: `${TILES_BASE_URL}/fonts/{fontstack}/{range}.pbf`,
          zoneId: initialZone,
          supranationalIds: supranationalRef.current,
          selectedId: initialSelected,
          colors: colorsRef.current,
          backdrop: backdropRef.current,
          zoneFill: zoneColor(initialZone, regionsRef.current),
        }),
        ...(camera
          ? { center: [camera.lng, camera.lat] as [number, number], zoom: camera.zoom }
          : {
              bounds: regionBounds(opening, regionsRef.current),
              fitBoundsOptions: { padding: containerFitPadding(FIT_PADDING, container), maxZoom: MAX_ZOOM },
            }),
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

    const setHover = (region: Region | null) => {
      if (hoveredRef.current?.id === region?.id) return;
      if (hoveredRef.current !== null) map.setFeatureState(featureState(hoveredRef.current), { hover: false });
      if (region !== null) map.setFeatureState(featureState(region), { hover: true });
      hoveredRef.current = region;
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

    map.on("load", () => {
      // Ready first: a failing decorative layer must not leave the region styling and selection disabled.
      setReady(true);
      // Topmost: drawn last of the layers, before MapLibre's atmosphere glow.
      map.addLayer(createStarfieldLayer());
      // Just before the stars: all draw "under" the frame, so the Moon and the Sun must go first to hide the stars
      // behind them. Order: Moon, Sun, stars.
      map.addLayer(createMoonLayer(), STARFIELD_LAYER);
      map.addLayer(createSunLayer(), STARFIELD_LAYER);
      // Over every map layer, under the Moon: darkens the side of the globe facing away from the Sun.
      map.addLayer(createNightLayer(), MOON_LAYER);
    });
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
      setHover(region.kind === "city" ? null : region);
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
    map.setFilter(REGION_BACKDROP_LAYER, backdropFilter(backdrop));
    map.setPaintProperty(REGION_BACKDROP_LAYER, "fill-color", fillColorExpression(backdrop));
  }, [ready, colors, backdrop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const zone = zoneFilters(zoneId, supranationalIds);
    map.setFilter(ZONE_FILL_LAYER, zone.fill);
    map.setFilter(ZONE_GLOW_LAYER, zone.fill);
    map.setPaintProperty(ZONE_FILL_LAYER, "fill-color", zoneColor(zoneId, regions) ?? EMPTY_FILL);
    map.setFilter(ZONE_LINE_LAYER, zone.line);
    map.setFilter(ZONE_SUPRA_SELECTED_LAYER, zone.supraSelected);
  }, [ready, zoneId, supranationalIds, regions]);

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
    if (region?.boundaryStatus === "missing") return;
    const container = containerRef.current;
    const padding = container ? containerFitPadding(FIT_PADDING, container) : FIT_PADDING;
    map.fitBounds(regionBounds(region, regionsRef.current), { padding, maxZoom: MAX_ZOOM });
  }, [ready, focus]);

  const listed = useMemo(() => visibleIds.flatMap((id) => regions.get(id) ?? []).sort(byName), [visibleIds, regions]);

  const onFocusRegion = (region: Region) => {
    const map = mapRef.current;
    if (!map || region.centroid === null) return;
    // Feature state throws until the style has loaded.
    if (ready && region.kind !== "city") {
      if (hoveredRef.current !== null && hoveredRef.current.id !== region.id) {
        map.setFeatureState(featureState(hoveredRef.current), { hover: false });
      }
      map.setFeatureState(featureState(region), { hover: true });
      hoveredRef.current = region;
    }
    const point = map.project(region.centroid);
    showTooltip(point.x + TOOLTIP_OFFSET, point.y + TOOLTIP_OFFSET, describe(region));
  };
  const onBlurRegion = (region: Region) => {
    if (ready && hoveredRef.current?.id === region.id) {
      mapRef.current?.setFeatureState(featureState(region), { hover: false });
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
      {!webglFailed && <div ref={containerRef} className="h-full w-full bg-space" />}
      {webglFailed ? (
        <>
          <p role="alert" className="bg-white p-3 text-body text-red-600">
            The map cannot be displayed on this device. Use the region list instead.
          </p>
          <RegionTree ids={rootIds} regions={regions} renderButton={(region) => regionButton(region, false)} />
        </>
      ) : (
        <ul
          aria-label="Regions on the map"
          className="sr-only text-body focus-within:not-sr-only focus-within:absolute focus-within:left-2 focus-within:top-2 focus-within:max-h-64 focus-within:overflow-y-auto focus-within:rounded focus-within:bg-white focus-within:p-1"
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
          className="pointer-events-none absolute rounded bg-black/80 px-2 py-1 text-body text-white"
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
    <ul className="max-h-64 overflow-y-auto bg-white p-1 text-body">
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
