export const makeSpotifyQueryKeys = (prefix: string) => ({
  all: [`${prefix}SpotifyTracks`] as const,
  list: (page: number) => [`${prefix}SpotifyTracks`, "list", page] as const,
  detail: (uuid: string) => [`${prefix}SpotifyTracks`, "detail", uuid] as const,
});
