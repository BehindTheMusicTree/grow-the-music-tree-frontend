const SPOTIFY_USER_PROFILE_BASE = "https://open.spotify.com/user";

export function spotifyUserProfileUrl(spotifyUserId: string): string {
  return `${SPOTIFY_USER_PROFILE_BASE}/${spotifyUserId}`;
}
