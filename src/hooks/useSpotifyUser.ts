import { useQuery } from "@tanstack/react-query";
import { SpotifyUserDetailedSchema, SpotifyUserDetailed } from "@/models/domain/spotify-user";
import { useFetchWrapper } from "./useFetchWrapper";

export function useSpotifyUser() {
  const { fetch } = useFetchWrapper();

  return useQuery<SpotifyUserDetailed>({
    queryKey: ["spotifyUser"],
    queryFn: async () => {
      const response = await fetch("user/spotify/");
      return SpotifyUserDetailedSchema.parse(response);
    },
  });
}
