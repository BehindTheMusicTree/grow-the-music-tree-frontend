import { z } from "zod";
import { SpotifyUserFromApiResponseSchema, SpotifyUserDetailed } from "@domain/spotify-user";
import { useFetchWrapper } from "./useFetchWrapper";
import { userEndpoints, userQueryKeys } from "../api/endpoints/user";
import { useQueryWithParse } from "./useQueryWithParse";

export function useFetchSpotifyUser() {
  const { fetch } = useFetchWrapper();

  return useQueryWithParse<SpotifyUserDetailed>({
    queryKey: userQueryKeys.spotify,
    queryFn: () => fetch(userEndpoints.spotify()),
    schema: SpotifyUserFromApiResponseSchema as z.ZodType<SpotifyUserDetailed>,
    context: "useFetchSpotifyUser",
  });
}
