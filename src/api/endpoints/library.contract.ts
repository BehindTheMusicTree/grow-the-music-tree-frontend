const makeLibraryQueryKeys = (prefix: string) => ({
  uploaded: {
    all: [`${prefix}UploadedTracks`] as const,
    list: (page: number) => [`${prefix}UploadedTracks`, "list", page] as const,
    detail: (uuid: string) => [`${prefix}UploadedTracks`, "detail", uuid] as const,
    download: (uuid: string) => [`${prefix}UploadedTracks`, "download", uuid] as const,
  },
  spotify: {
    all: [`${prefix}SpotifyTracks`] as const,
    list: (page: number) => [`${prefix}SpotifyTracks`, "list", page] as const,
    detail: (uuid: string) => [`${prefix}SpotifyTracks`, "detail", uuid] as const,
  },
});

export const libraryQueryKeys = {
  me: makeLibraryQueryKeys("my"),
  reference: makeLibraryQueryKeys("reference"),
};

const makeLibraryEndpoints = (root: string) => ({
  uploaded: {
    list: () => `${root}/library/uploaded/`,
    detail: (uuid: string) => `${root}/library/uploaded/${uuid}`,
    create: () => `${root}/library/uploaded/`,
    update: (uuid: string) => `${root}/library/uploaded/${uuid}/`,
    delete: (uuid: string) => `${root}/library/uploaded/${uuid}`,
    download: (uuid: string) => `${root}/library/uploaded/${uuid}/download`,
  },
  spotify: {
    list: () => `${root}/library/spotify/`,
    detail: (uuid: string) => `${root}/library/spotify/${uuid}`,
    syncQuick: () => `${root}/library/spotify/sync/quick/`,
    syncFull: () => `${root}/library/spotify/sync/full/`,
  },
});

export const libraryEndpoints = {
  me: makeLibraryEndpoints("me"),
  reference: makeLibraryEndpoints("reference"),
};
