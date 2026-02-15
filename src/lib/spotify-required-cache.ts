const SPOTIFY_REQUIRED_KEY = "spotify_required";

export function getSpotifyRequiredCached(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SPOTIFY_REQUIRED_KEY) === "1";
}

export function setSpotifyRequiredCached(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SPOTIFY_REQUIRED_KEY, "1");
}

export function clearSpotifyRequiredCached(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SPOTIFY_REQUIRED_KEY);
}
