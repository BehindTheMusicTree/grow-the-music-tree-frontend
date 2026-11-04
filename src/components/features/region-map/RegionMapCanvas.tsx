"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { addProtocol, Map as MapLibreMap, setWorkerUrl, type MapLayerMouseEvent } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useHoverTooltip } from "@hooks/useHoverTooltip";
import { publicEnv } from "@lib/env";
import type { Region } from "@schemas/api/region-map";
import {
  buildStyle,
  describe,
  fillColorExpression,
  levelBounds,
  levelFilter,
  levelRegions,
  MAX_ZOOM,
  REGION_FILL_LAYER,
  REGION_LABEL_LAYER,
  REGION_LINE_LAYER,
  REGIONS_SOURCE_LAYER,
  regionColors,
  TILES_SOURCE,
  ZONE_FILL_LAYER,
  ZONE_LINE_LAYER,
  zoneFilter,
} from "./regionMapLayers";


type Props = {
  levelId: string;
  /** The regions drawn at this level. */
  childIds: readonly string[];
  /** sha256 of the vector tileset (`regions/<sha256>.pmtiles` in the tiles bucket), from the index; immutable per content hash. */
  tileset: string;
  zoneId: string | null;
  regions: ReadonlyMap<string, Region>;
  selectedId: string | null;
  onRegionClick: (region: Region) => void;
};

const TOOLTIP_OFFSET = 12;
const ON_GLOBE_TOLERANCE_PX = 1;
const TILES_BASE_URL = publicEnv.NEXT_PUBLIC_TILES_BASE_URL;
const regionState = (id: string) => ({ source: TILES_SOURCE, sourceLayer: REGIONS_SOURCE_LAYER, id });

addProtocol("pmtiles", new Protocol().tile);

// MapLibre 6 locates its worker from `import.meta.url`, which a bundler rewrites, so the worker must be emitted explicitly.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

export default function RegionMapCanvas({ levelId, childIds, tileset, zoneId, regions, selectedId, onRegionClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const regionsRef = useRef(regions);
  const onClickRef = useRef(onRegionClick);
  const initialRef = useRef({ childIds, zoneId });
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const fittedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const { text: tooltipText, ref: tooltipRef, show: showTooltip, hide: hideTooltip } = useHoverTooltip();

  useEffect(() => {
    regionsRef.current = regions;
    onClickRef.current = onRegionClick;
    initialRef.current = { childIds, zoneId };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        style: buildStyle({
          tilesetUrl: `${TILES_BASE_URL}/regions/${tileset}.pmtiles`,
          glyphsUrl: `${TILES_BASE_URL}/fonts/{fontstack}/{range}.pbf`,
          ...initialRef.current,
          colors: regionColors(
            levelRegions(regionsRef.current, initialRef.current.childIds).map((region) => region.id),
            regionsRef.current,
          ),
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

    const setHover = (id: string | null) => {
      if (hoveredRef.current === id) return;
      if (hoveredRef.current !== null) {
        map.setFeatureState(regionState(hoveredRef.current), { hover: false });
      }
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
      const id = event.features?.[0]?.properties?.id;
      return typeof id === "string" ? regionsRef.current.get(id) : undefined;
    };
    const clearHover = () => {
      setHover(null);
      map.getCanvas().style.cursor = "default";
      hideTooltip();
    };

    map.on("load", () => setReady(true));
    map.on("click", REGION_FILL_LAYER, (event) => {
      const region = regionAt(event);
      if (region) onClickRef.current(region);
    });
    map.on("mousemove", REGION_FILL_LAYER, (event) => {
      const region = regionAt(event);
      if (!region) {
        clearHover();
        return;
      }
      setHover(region.id);
      map.getCanvas().style.cursor = "pointer";
      showTooltip(event.point.x + TOOLTIP_OFFSET, event.point.y + TOOLTIP_OFFSET, describe(region));
    });
    map.on("mouseleave", REGION_FILL_LAYER, clearHover);

    return () => {
      map.remove();
      mapRef.current = null;
      hoveredRef.current = null;
      selectedRef.current = null;
      fittedRef.current = false;
      setReady(false);
    };
  }, [tileset, showTooltip, hideTooltip]);

  const listed = useMemo(() => levelRegions(regions, childIds), [regions, childIds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const filter = levelFilter(childIds);
    map.setFilter(REGION_FILL_LAYER, filter);
    map.setFilter(REGION_LINE_LAYER, filter);
    map.setFilter(REGION_LABEL_LAYER, filter);
    const colors = regionColors(
      listed.map((region) => region.id),
      regions,
    );
    map.setPaintProperty(REGION_FILL_LAYER, "fill-color", fillColorExpression(colors));
    map.removeFeatureState({ source: TILES_SOURCE, sourceLayer: REGIONS_SOURCE_LAYER });
    hoveredRef.current = null;
    selectedRef.current = null;
    map.fitBounds(levelBounds(levelId, regions), {
      padding: 24,
      maxZoom: MAX_ZOOM,
      animate: fittedRef.current,
    });
    fittedRef.current = true;
  }, [ready, levelId, childIds, listed, regions]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setFilter(ZONE_FILL_LAYER, zoneFilter(zoneId));
    map.setFilter(ZONE_LINE_LAYER, zoneFilter(zoneId));
  }, [ready, zoneId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    if (selectedRef.current !== null) {
      map.setFeatureState(regionState(selectedRef.current), { selected: false });
    }
    if (selectedId !== null) map.setFeatureState(regionState(selectedId), { selected: true });
    selectedRef.current = selectedId;
  }, [ready, levelId, selectedId]);

  const onFocusRegion = (region: Region) => {
    const map = mapRef.current;
    if (!map) return;
    // Feature state throws until the style has loaded.
    if (ready) {
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
    if (ready) mapRef.current?.setFeatureState(regionState(region.id), { hover: false });
    hoveredRef.current = null;
    hideTooltip();
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg" role="group" aria-label="Region map">
      {!webglFailed && <div ref={containerRef} className="h-full w-full" />}
      {webglFailed && (
        <p role="alert" className="bg-white p-3 text-sm text-red-600">
          The map cannot be displayed on this device. Use the region list instead.
        </p>
      )}
      <ul
        className={
          webglFailed
            ? "max-h-64 overflow-y-auto bg-white p-1 text-sm"
            : "sr-only text-sm focus-within:not-sr-only focus-within:absolute focus-within:left-2 focus-within:top-2 focus-within:max-h-64 focus-within:overflow-y-auto focus-within:rounded focus-within:bg-white focus-within:p-1"
        }
      >
        {listed.map((region) => (
          <li key={region.id}>
            <button
              type="button"
              aria-label={describe(region)}
              aria-pressed={selectedId === region.id}
              onClick={() => onRegionClick(region)}
              onFocus={() => onFocusRegion(region)}
              onBlur={() => onBlurRegion(region)}
              className="w-full rounded px-2 py-1 text-left hover:bg-gray-100 focus-visible:outline focus-visible:outline-2"
            >
              {region.name}
            </button>
          </li>
        ))}
      </ul>
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
