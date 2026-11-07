"use client";

import { AppError, ErrorCode, useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { RegionMapIndexSchema } from "@schemas/api/region-map";

/** The region map index, or null while grow-api has no snapshot yet (404). `enabled` defers the fetch, e.g. to a search box's first focus. */
export function useRegionMapIndex(enabled = true) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  return useQueryWithParse({
    queryKey: ["regionMap", "index"],
    enabled,
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
