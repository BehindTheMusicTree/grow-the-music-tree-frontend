import { z } from "zod";
import { SpotifyUserFromApiResponseSchema, SpotifyUserDetailed } from "@domain/spotify-user";
import { useSession, getSpotifyRequiredCached, setSpotifyRequiredCached, clearSpotifyRequiredCached } from "@behindthemusictree/app-kit/auth";
import { useFetchWrapper, useQueryWithParse, ErrorCode, BackendError } from "@behindthemusictree/app-kit/transport";
import { userEndpoints, userQueryKeys } from "@api/domains/user";
import { getBackendBaseUrl } from "@lib/site-urls";

export function useFetchSpotifyUser(options?: { skipGlobalError?: boolean; enabled?: boolean }) {
  const { sessionRestored } = useSession();
  const { fetch } = useFetchWrapper(getBackendBaseUrl);
  const skipGlobalError = options?.skipGlobalError ?? false;
  const enabledOverride = options?.enabled ?? true;
  const spotifyRequiredCached = getSpotifyRequiredCached();

  return useQueryWithParse<SpotifyUserDetailed>({
    queryKey: userQueryKeys.spotify,
    queryFn: async () => {
      try {
        const result = await fetch(userEndpoints.spotify(), true, true, {}, undefined, false, skipGlobalError);
        if (result == null) {
          throw new Error("Spotify profile unavailable");
        }
        clearSpotifyRequiredCached();
        return result as SpotifyUserDetailed;
      } catch (e) {
        if (e instanceof BackendError && e.code === ErrorCode.BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED) {
          setSpotifyRequiredCached();
        }
        throw e;
      }
    },
    schema: SpotifyUserFromApiResponseSchema as z.ZodType<SpotifyUserDetailed>,
    context: "useFetchSpotifyUser",
    enabled: sessionRestored && !spotifyRequiredCached && enabledOverride,
  });
}
