import { SpotifyTrack } from "@/models/interfaces/spotify";
import { ApiSpotifyLibTrackDto } from "@/types/dto/spotify";

export function mapSpotifyLibTrackDtoToDomain(dto: ApiSpotifyLibTrackDto): SpotifyTrack {
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
