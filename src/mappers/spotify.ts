import { SpotifyUser, SpotifyPlaylist, SpotifyTrack } from "@/models/interfaces/spotify";
import { ApiSpotifyUserDto, ApiSpotifyPlaylistDto, ApiSpotifyLibTrackDto } from "@/types/api/spotify";

export function mapSpotifyUserDtoToDomain(dto: ApiSpotifyUserDto): SpotifyUser {
  return {
    id: dto.id,
    displayName: dto.display_name,
    email: dto.email,
    imageUrl: dto.images?.[0]?.url,
  };
}

export function mapSpotifyPlaylistDtoToDomain(dto: ApiSpotifyPlaylistDto): SpotifyPlaylist {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    spotifyId: dto.spotify_id,
    spotifyUri: dto.spotify_uri,
    spotifyUrl: dto.spotify_url,
    owner: mapSpotifyUserDtoToDomain(dto.owner),
    tracksCount: dto.tracks_count,
    imageUrl: dto.images?.[0]?.url,
    createdOn: new Date().toISOString(), // TODO: Get from API
    updatedOn: new Date().toISOString(), // TODO: Get from API
  };
}

export function mapSpotifyTrackDtoToDomain(dto: ApiSpotifyLibTrackDto): SpotifyTrack {
  return {
    id: dto.id,
    name: dto.name,
    artists: dto.artists.map((artist: { name: string }) => artist.name),
    album: dto.album.name,
    spotifyId: dto.spotify_id,
    spotifyUri: dto.spotify_uri,
    spotifyUrl: dto.spotify_url,
    durationMs: dto.duration_ms,
    imageUrl: dto.album.images?.[0]?.url,
    createdOn: new Date().toISOString(), // TODO: Get from API
    updatedOn: new Date().toISOString(), // TODO: Get from API
  };
}
