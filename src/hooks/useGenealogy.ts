"use client";

import { AppError, ErrorCode, useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { GenealogySchema } from "@schemas/api/genealogy";

/** The genealogy snapshot, or null while grow-api has none yet (404). */
export function useGenealogy() {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  return useQueryWithParse({
    queryKey: ["genealogy"],
    queryFn: async () => {
      try {
        return await fetch("genealogy/", true, false, {}, undefined, false, true);
      } catch (error) {
        if (error instanceof AppError && error.code === ErrorCode.BACKEND_NOT_FOUND) return null;
        throw error;
      }
    },
    schema: GenealogySchema.nullable(),
    context: "useGenealogy",
  });
}
