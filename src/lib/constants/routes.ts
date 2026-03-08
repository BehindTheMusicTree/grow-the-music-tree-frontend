export const REFERENCE_GENRE_TREE_PATH = "/reference-genre-tree";

export const LOGOUT_REDIRECT_PATH = REFERENCE_GENRE_TREE_PATH;

export type RouteAuthRequirement = false | "any" | "spotify";

export interface RouteAuthConfigItem {
  path: string;
  authRequired: RouteAuthRequirement;
  label: string;
}

export const ROUTE_AUTH_CONFIG: readonly RouteAuthConfigItem[] = [
  { path: "/reference-genre-tree", authRequired: false, label: "Reference Genre Tree" },
  { path: "/me-genre-tree", authRequired: "any", label: "My Genre Tree" },
  { path: "/me-genre-playlists", authRequired: "any", label: "My Genre Playlists" },
  { path: "/me-uploaded-library", authRequired: "any", label: "My Uploaded Library" },
  { path: "/me-spotify-library", authRequired: "spotify", label: "My Spotify Library" },
  { path: "/account", authRequired: "any", label: "Account" },
  { path: "/metadata-manager", authRequired: false, label: "Metadata Manager" },
  { path: "/about", authRequired: false, label: "About" },
];

export function getRouteAuthRequirement(pathname: string): RouteAuthRequirement {
  if (pathname === "/") return false;
  const entry = ROUTE_AUTH_CONFIG.find((r) => pathname === r.path || pathname.startsWith(`${r.path}/`));
  return entry?.authRequired ?? false;
}

export const spotifyUserProfileUrl = (spotifyUserId: string) => `https://open.spotify.com/user/${spotifyUserId}`;
