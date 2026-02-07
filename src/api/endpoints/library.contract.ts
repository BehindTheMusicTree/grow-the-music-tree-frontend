export const libraryQueryKeys = {
  uploaded: {
    all: ["uploadedTracks"] as const,
    list: (page: number) => ["uploadedTracks", "list", page] as const,
    detail: (uuid: string) => ["uploadedTracks", "detail", uuid] as const,
    download: (uuid: string) => ["uploadedTracks", "download", uuid] as const,
  },
  spotify: {
    all: ["spotifyTracks"] as const,
  },
};

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
