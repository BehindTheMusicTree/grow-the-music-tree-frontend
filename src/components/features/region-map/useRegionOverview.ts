"use client";

import { useGenreByWikidataId } from "@behindthemusictree/app-kit/genre-tree";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import type { Region } from "@schemas/api/region-map";

/** The genre a region's panel opens on, and the name that panel goes by. */
export function useRegionOverview(region: Region | undefined) {
  const overviewId = region ? (region.overviewItemId ?? region.inheritedOverviewItemId) : null;
  const overview = useGenreByWikidataId(overviewId, "reference", getGrowBackendBaseUrl);
  const failed = overview.isError || overview.data === null;
  // Null while loading, so a search box does not flash the region name before the genre's.
  const fallbackName = overviewId === null || failed ? (region?.name ?? null) : null;

  return {
    overviewId,
    uuid: overview.data?.uuid,
    failed,
    panelName: overview.data?.name ?? fallbackName,
  };
}
