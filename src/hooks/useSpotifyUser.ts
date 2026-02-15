import { z } from "zod";
import { SpotifyUserFromApiResponseSchema, SpotifyUserDetailed } from "@domain/spotify-user";
import { useSession } from "@contexts/SessionContext";
import { useFetchWrapper } from "./useFetchWrapper";
import { userEndpoints, userQueryKeys } from "../api/endpoints/user";
import { useQueryWithParse } from "./useQueryWithParse";

export function useFetchSpotifyUser(options?: { skipGlobalError?: boolean }) {
  const { sessionRestored } = useSession();
  const { fetch } = useFetchWrapper();
  const skipGlobalError = options?.skipGlobalError ?? false;

  return useQueryWithParse<SpotifyUserDetailed>({
    queryKey: userQueryKeys.spotify,
    queryFn: () =>
      fetch(userEndpoints.spotify(), true, true, {}, undefined, false, skipGlobalError),
    schema: SpotifyUserFromApiResponseSchema as z.ZodType<SpotifyUserDetailed>,
    context: "useFetchSpotifyUser",
    enabled: sessionRestored,
  });
}
