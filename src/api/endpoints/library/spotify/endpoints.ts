export const makeSpotifyEndpoints = (root: string) => ({
  list: () => `${root}/library/spotify/`,
  detail: (uuid: string) => `${root}/library/spotify/${uuid}`,
  syncQuick: () => `${root}/library/spotify/sync/quick/`,
  syncFull: () => `${root}/library/spotify/sync/full/`,
});
