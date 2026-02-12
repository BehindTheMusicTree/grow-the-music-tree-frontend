import { useQuery } from "@tanstack/react-query";
import { SpotifyUserDetailedSchema, SpotifyUserDetailed } from "@domain/spotify-user";
import { useFetchWrapper } from "./useFetchWrapper";
import { userEndpoints, userQueryKeys } from "../api/endpoints/user";

export function useSpotifyUser() {
  const { fetch } = useFetchWrapper();

  return useQuery<SpotifyUserDetailed>({
    queryKey: userQueryKeys.spotify,
    queryFn: async () => {
      const response = await fetch(userEndpoints.spotify());
      return SpotifyUserDetailedSchema.parse(response);
    },
  });
}
