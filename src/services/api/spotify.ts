import { AuthFetch } from "@/hooks/useAuthenticatedApi";
import { SpotifyUser, SpotifyPlaylist, SpotifyTrack } from "@/models/interfaces/spotify";
import { ApiSpotifyUserDto, ApiSpotifyPlaylistDto, ApiSpotifyLibTrackDto } from "@/types/api/spotify";
import {
  mapSpotifyUserDtoToDomain,
  mapSpotifyPlaylistDtoToDomain,
  mapSpotifyTrackDtoToDomain,
} from "@/mappers/spotify";
import { ApiResponse } from "@/types/api";

export class SpotifyService {
  constructor(private authFetch: AuthFetch) {}

  async getUser(): Promise<SpotifyUser> {
    const response = await this.authFetch("/spotify/user");
    const apiResponse: ApiResponse<ApiSpotifyUserDto> = await response.json();
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error?.message || "Failed to fetch user");
    }
    return mapSpotifyUserDtoToDomain(apiResponse.data);
  }

  async getPlaylist(id: string): Promise<SpotifyPlaylist> {
    const response = await this.authFetch(`/spotify/playlists/${id}`);
    const apiResponse: ApiResponse<ApiSpotifyPlaylistDto> = await response.json();
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error?.message || "Failed to fetch playlist");
    }
    return mapSpotifyPlaylistDtoToDomain(apiResponse.data);
  }

  async getTrack(id: string): Promise<SpotifyTrack> {
    const response = await this.authFetch(`/spotify/tracks/${id}`);
    const apiResponse: ApiResponse<ApiSpotifyLibTrackDto> = await response.json();
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error?.message || "Failed to fetch track");
    }
    return mapSpotifyTrackDtoToDomain(apiResponse.data);
  }
}
