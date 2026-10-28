import { z } from "zod";
import { AppError, ErrorCode, useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { ArtistDetailedSchema } from "@schemas/api/artist";

const isNotFound = (error: Error | null) => error instanceof AppError && error.code === ErrorCode.BACKEND_NOT_FOUND;

export function useArtist(uuid: string | null) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  // grow-api answers 400 to a malformed uuid; treat it as not found, and never put a raw URL value in the path.
  const isUuid = uuid !== null && z.string().uuid().safeParse(uuid).success;
  const { data, isPending, error } = useQueryWithParse({
    queryKey: ["artist", uuid],
    // A missing artist is shown in the panel, not raised as an app-wide connectivity error.
    queryFn: () => fetch(`artists/${uuid}/`, true, false, undefined, undefined, false, true),
    schema: ArtistDetailedSchema,
    enabled: isUuid,
    retry: (failureCount, retryError) => !isNotFound(retryError) && failureCount < 3,
    context: "useArtist",
  });

  if (uuid === null) return { status: "idle" } as const;
  if (!isUuid || isNotFound(error)) return { status: "not-found" } as const;
  if (error) return { status: "error" } as const;
  if (isPending) return { status: "loading" } as const;
  return { status: "success", artist: data } as const;
}
