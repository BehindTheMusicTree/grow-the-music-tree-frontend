"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Map as MapLibreMap, setWorkerUrl, type GeoJSONSource, type MapLayerMouseEvent } from "maplibre-gl";
import type { Region, RegionFeatureCollection } from "@schemas/api/region-map";
import {
  buildStyle,
  describe,
  EMPTY_COLLECTION,
  fillColorExpression,
  levelBounds,
  LEVEL_SOURCE,
  MAX_ZOOM,
  REGION_FILL_LAYER,
  regionColors,
  ZONE_SOURCE,
} from "./regionMapLayers";

type Tooltip = { x: number; y: number; text: string };

type Props = {
  levelId: string;
  /** Undefined while the level is loading: the previous level stays on the map until the new one arrives. */
  level: RegionFeatureCollection | undefined;
  zone: RegionFeatureCollection | undefined;
  regions: ReadonlyMap<string, Region>;
  selectedId: string | null;
  onRegionClick: (region: Region) => void;
};

const TOOLTIP_OFFSET = 12;

// MapLibre 6 locates its worker from `import.meta.url`, which a bundler rewrites, so the worker must be emitted explicitly.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

export default function RegionMapCanvas({ levelId, level, zone, regions, selectedId, onRegionClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const regionsRef = useRef(regions);
  const onClickRef = useRef(onRegionClick);
  const levelIdRef = useRef(levelId);
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const fittedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    regionsRef.current = regions;
    onClickRef.current = onRegionClick;
    levelIdRef.current = levelId;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        style: buildStyle(),
        maxZoom: MAX_ZOOM,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true, customAttribution: "Natural Earth" },
      });
    } catch {
      setWebglFailed(true);
      return;
    }
    mapRef.current = map;

    const setHover = (id: string | null) => {
      if (hoveredRef.current === id) return;
      if (hoveredRef.current !== null) {
        map.setFeatureState({ source: LEVEL_SOURCE, id: hoveredRef.current }, { hover: false });
      }
      if (id !== null) map.setFeatureState({ source: LEVEL_SOURCE, id }, { hover: true });
      hoveredRef.current = id;
    };
    const regionAt = (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id;
      return typeof id === "string" ? regionsRef.current.get(id) : undefined;
    };

    map.on("load", () => setReady(true));
    map.on("click", REGION_FILL_LAYER, (event) => {
      const region = regionAt(event);
      // While the next level loads, the previous level's features are still on the map and must not be drillable.
      if (region && region.parentId === levelIdRef.current) onClickRef.current(region);
    });
    map.on("mousemove", REGION_FILL_LAYER, (event) => {
      const region = regionAt(event);
      if (!region) return;
      setHover(region.id);
      map.getCanvas().style.cursor = region.drillable ? "zoom-in" : "pointer";
      setTooltip({ x: event.point.x + TOOLTIP_OFFSET, y: event.point.y + TOOLTIP_OFFSET, text: describe(region) });
    });
    map.on("mouseleave", REGION_FILL_LAYER, () => {
      setHover(null);
      map.getCanvas().style.cursor = "";
      setTooltip(null);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      hoveredRef.current = null;
      selectedRef.current = null;
      fittedRef.current = false;
      setReady(false);
    };
  }, []);

  const levelIds = useMemo(() => level?.features.map((feature) => feature.id) ?? [], [level]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !level) return;
    const source = map.getSource<GeoJSONSource>(LEVEL_SOURCE);
    if (!source) return;
    source.setData(level as unknown as GeoJSON.FeatureCollection);
    map.setPaintProperty(REGION_FILL_LAYER, "fill-color", fillColorExpression(regionColors(levelIds, regions)));
    map.removeFeatureState({ source: LEVEL_SOURCE });
    hoveredRef.current = null;
    selectedRef.current = null;
    map.fitBounds(levelBounds(levelId, regions), {
      padding: 24,
      maxZoom: MAX_ZOOM,
      animate: fittedRef.current,
    });
    fittedRef.current = true;
  }, [ready, level, levelId, levelIds, regions]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map
      .getSource<GeoJSONSource>(ZONE_SOURCE)
      ?.setData((zone as unknown as GeoJSON.FeatureCollection | undefined) ?? EMPTY_COLLECTION);
  }, [ready, zone]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    if (selectedRef.current !== null) {
      map.setFeatureState({ source: LEVEL_SOURCE, id: selectedRef.current }, { selected: false });
    }
    if (selectedId !== null) map.setFeatureState({ source: LEVEL_SOURCE, id: selectedId }, { selected: true });
    selectedRef.current = selectedId;
  }, [ready, level, selectedId]);

  const listed = useMemo(
    () => Array.from(regions.values()).filter((region) => region.parentId === levelId),
    [regions, levelId],
  );

  const onFocusRegion = (region: Region) => {
    const map = mapRef.current;
    if (!map) return;
    // Feature state throws until the style has loaded.
    if (ready) {
      if (hoveredRef.current !== null && hoveredRef.current !== region.id) {
        map.setFeatureState({ source: LEVEL_SOURCE, id: hoveredRef.current }, { hover: false });
      }
      map.setFeatureState({ source: LEVEL_SOURCE, id: region.id }, { hover: true });
      hoveredRef.current = region.id;
    }
    const point = map.project(region.centroid);
    setTooltip({ x: point.x + TOOLTIP_OFFSET, y: point.y + TOOLTIP_OFFSET, text: describe(region) });
  };
  const onBlurRegion = (region: Region) => {
    if (ready) mapRef.current?.setFeatureState({ source: LEVEL_SOURCE, id: region.id }, { hover: false });
    hoveredRef.current = null;
    setTooltip(null);
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
              aria-pressed={region.drillable ? undefined : selectedId === region.id}
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
      {tooltip && (
        <div
          aria-hidden
          data-tooltip
          className="pointer-events-none absolute rounded bg-black/80 px-2 py-1 text-sm text-white"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
