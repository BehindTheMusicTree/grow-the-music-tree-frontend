"use client";

import { AppError, ErrorCode, useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { RegionFeatureCollectionSchema, RegionMapIndexSchema } from "@schemas/api/region-map";

/** The region map index, or null while grow-api has no snapshot yet (404). */
export function useRegionMapIndex() {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  return useQueryWithParse({
    queryKey: ["regionMap", "index"],
    queryFn: async () => {
      try {
        return await fetch("regions/map/", true, false, {}, undefined, false, true);
      } catch (error) {
        if (error instanceof AppError && error.code === ErrorCode.BACKEND_NOT_FOUND) return null;
        throw error;
      }
    },
    schema: RegionMapIndexSchema.nullable(),
    context: "useRegionMapIndex",
  });
}

/** One region map GeoJSON file by content hash; a hash never changes meaning, so it never goes stale. */
export function useRegionMapFile(sha256: string | undefined) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  return useQueryWithParse({
    queryKey: ["regionMap", "file", sha256],
    queryFn: () => fetch(`regions/map/files/${sha256}/`, true, false),
    schema: RegionFeatureCollectionSchema,
    context: "useRegionMapFile",
    enabled: sha256 !== undefined,
    staleTime: Infinity,
  });
}
