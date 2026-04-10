export const PATHS = {
  REFERENCE_GENRE_TREE: "/reference-genre-tree",
  ME_GENRE_TREE: "/me-genre-tree",
  ME_GENRE_PLAYLISTS: "/me-genre-playlists",
  ME_UPLOADED_LIBRARY: "/me-uploaded-library",
  ME_SPOTIFY_LIBRARY: "/me-spotify-library",
  ACCOUNT: "/account",
  ABOUT: "/about",
};

export const LOGOUT_REDIRECT_PATH = PATHS.REFERENCE_GENRE_TREE;

export type RouteAuthRequirement = false | "any" | "spotify";

export interface RouteAuthConfigItem {
  path: string;
  authRequired: RouteAuthRequirement;
  label: string;
}

export const ROUTE_AUTH_CONFIG: readonly RouteAuthConfigItem[] = [
  { path: PATHS.ME_GENRE_TREE, authRequired: "any", label: "MyMusicTree" },
  { path: PATHS.ME_GENRE_PLAYLISTS, authRequired: "any", label: "My Genre Playlists" },
  { path: PATHS.ME_UPLOADED_LIBRARY, authRequired: "any", label: "My Library" },
  { path: PATHS.ME_SPOTIFY_LIBRARY, authRequired: "spotify", label: "My Spotify Library" },
  { path: PATHS.ACCOUNT, authRequired: "any", label: "Account" },
  { path: PATHS.ABOUT, authRequired: false, label: "About" },
];

/** Still in {@link ROUTE_AUTH_CONFIG} for auth; omitted from the main header nav. */
export const ROUTE_PATHS_EXCLUDED_FROM_HEADER_NAV: ReadonlySet<string> = new Set([
  PATHS.ME_SPOTIFY_LIBRARY,
  PATHS.ACCOUNT,
  PATHS.ABOUT,
]);

export function getRouteAuthRequirement(pathname: string): RouteAuthRequirement {
  if (pathname === "/") return false;
  const entry = ROUTE_AUTH_CONFIG.find((r) => pathname === r.path || pathname.startsWith(`${r.path}/`));
  return entry?.authRequired ?? false;
}

export const spotifyUserProfileUrl = (spotifyUserId: string) => `https://open.spotify.com/user/${spotifyUserId}`;
