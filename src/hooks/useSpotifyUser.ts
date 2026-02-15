import { z } from "zod";
import { SpotifyUserFromApiResponseSchema, SpotifyUserDetailed } from "@domain/spotify-user";
import { useSession } from "@contexts/SessionContext";
import { useFetchWrapper } from "./useFetchWrapper";
import { userEndpoints, userQueryKeys } from "../api/endpoints/user";
import { useQueryWithParse } from "./useQueryWithParse";
import {
  getSpotifyRequiredCached,
  setSpotifyRequiredCached,
  clearSpotifyRequiredCached,
} from "@lib/spotify-required-cache";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { BackendError } from "@app-types/app-errors/app-error";

export function useFetchSpotifyUser(options?: { skipGlobalError?: boolean }) {
  const { sessionRestored } = useSession();
  const { fetch } = useFetchWrapper();
  const skipGlobalError = options?.skipGlobalError ?? false;
  const spotifyRequiredCached = getSpotifyRequiredCached();

  return useQueryWithParse<SpotifyUserDetailed>({
    queryKey: userQueryKeys.spotify,
    queryFn: async () => {
      try {
        const result = await fetch(
          userEndpoints.spotify(),
          true,
          true,
          {},
          undefined,
          false,
          skipGlobalError,
        );
        if (result != null) {
          clearSpotifyRequiredCached();
        }
        return result as SpotifyUserDetailed;
      } catch (e) {
        if (
          e instanceof BackendError &&
          e.code === ErrorCode.BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED
        ) {
          setSpotifyRequiredCached();
        }
        throw e;
      }
    },
    schema: SpotifyUserFromApiResponseSchema as z.ZodType<SpotifyUserDetailed>,
    context: "useFetchSpotifyUser",
    enabled: sessionRestored && !spotifyRequiredCached,
  });
}
