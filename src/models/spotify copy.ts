export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images?: { url: string }[];
}

export interface ApiSpotifyAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  spotifyUser: SpotifyUser;
}
