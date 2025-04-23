import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { SpotifyService } from "@/services/api/spotify";
import { SpotifyUser, SpotifyPlaylist, SpotifyTrack } from "@/models/interfaces/spotify";
import { ApiResponse } from "@/types/api";

export function useSpotify() {
  const getUser = useAuthenticatedApi<SpotifyUser>((authFetch) => {
    const service = new SpotifyService(authFetch);
    return service.getUser();
  });

  const getPlaylist = useAuthenticatedApi<SpotifyPlaylist, [string]>((authFetch, id) => {
    const service = new SpotifyService(authFetch);
    return service.getPlaylist(id);
  });

  const getTrack = useAuthenticatedApi<SpotifyTrack, [string]>((authFetch, id) => {
    const service = new SpotifyService(authFetch);
    return service.getTrack(id);
  });

  const useUser = () => {
    return useQuery<SpotifyUser>({
      queryKey: ["spotify", "user"],
      queryFn: async () => {
        const response = await getUser();
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || "Failed to fetch user");
        }
        return response.data;
      },
    });
  };

  const usePlaylist = (id: string) => {
    return useQuery<SpotifyPlaylist>({
      queryKey: ["spotify", "playlist", id],
      queryFn: async () => {
        const response = await getPlaylist(id);
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || "Failed to fetch playlist");
        }
        return response.data;
      },
    });
  };

  const useTrack = (id: string) => {
    return useQuery<SpotifyTrack>({
      queryKey: ["spotify", "track", id],
      queryFn: async () => {
        const response = await getTrack(id);
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || "Failed to fetch track");
        }
        return response.data;
      },
    });
  };

  return {
    useUser,
    usePlaylist,
    useTrack,
  };
}
