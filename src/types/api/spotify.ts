export interface ApiSpotifyUserDto {
  id: string;
  display_name: string;
  email: string;
  images?: Array<{ url: string }>;
}

export interface ApiSpotifyPlaylistDto {
  id: string;
  name: string;
  description?: string;
  spotify_id: string;
  spotify_uri: string;
  spotify_url: string;
  owner: ApiSpotifyUserDto;
  tracks_count: number;
  images?: Array<{ url: string }>;
}

export interface ApiSpotifyLibTrackDto {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images?: Array<{ url: string }>;
  };
  spotify_id: string;
  spotify_uri: string;
  spotify_url: string;
  duration_ms: number;
}
