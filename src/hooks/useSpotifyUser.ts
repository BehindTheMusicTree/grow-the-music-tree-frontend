import { useQuery } from "@tanstack/react-query";
import { SpotifyUserDetailedSchema, SpotifyUserDetailed } from "@domain/spotify-user";
import { useFetchWrapper } from "./useFetchWrapper";
import { userEndpoints, SPOTIFY_USER_KEY } from "../api/endpoints/user.contract";

export function useSpotifyUser() {
  const { fetch } = useFetchWrapper();

  return useQuery<SpotifyUserDetailed>({
    queryKey: [SPOTIFY_USER_KEY],
    queryFn: async () => {
      const response = await fetch(userEndpoints.spotify());
      return SpotifyUserDetailedSchema.parse(response);
    },
  });
}
