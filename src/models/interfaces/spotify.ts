import { UuidResource } from "./base";

export interface SpotifyUser {
  id: string;
  displayName: string;
  email: string;
  imageUrl?: string;
}

export interface SpotifyAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  spotifyUser: SpotifyUser;
}

export interface SpotifyPlaylist extends UuidResource {
  name: string;
  description?: string;
  spotifyId: string;
  spotifyUri: string;
  spotifyUrl: string;
  owner: SpotifyUser;
  tracksCount: number;
  imageUrl?: string;
}

export interface SpotifyTrack extends UuidResource {
  name: string;
  artists: string[];
  album: string;
  spotifyId: string;
  spotifyUri: string;
  spotifyUrl: string;
  durationMs: number;
  imageUrl?: string;
}
