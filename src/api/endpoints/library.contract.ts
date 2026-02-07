export const UPLOADED_TRACKS_KEY = "uploadedTracks";
export const SPOTIFY_TRACKS_KEY = "spotifyTracks";

export const libraryEndpoints = {
  uploaded: {
    list: () => "library/uploaded/",
    create: () => "library/uploaded/",
    update: (uuid: string) => `library/uploaded/${uuid}/`,
    delete: (uuid: string) => `library/uploaded/${uuid}`,
    download: (uuid: string) => `library/uploaded/${uuid}/download`,
  },
  spotify: {
    list: () => "library/spotify",
    syncQuick: () => "library/spotify/sync/quick/",
    syncFull: () => "library/spotify/sync/full/",
  },
};
