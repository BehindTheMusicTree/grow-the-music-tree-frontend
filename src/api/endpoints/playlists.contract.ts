export const playlistQueryKeys = {
  me: {
    all: ["genrePlaylists"] as const,
    list: (page: number) => ["genrePlaylists", "list", page] as const,
    detail: (uuid: string) => ["genrePlaylists", uuid] as const,
  },
  reference: {
    all: ["referenceGenrePlaylists"] as const,
    list: (page: number) => ["referenceGenrePlaylists", "list", page] as const,
    detail: (uuid: string) => ["referenceGenrePlaylists", uuid] as const,
  },
};

export const playlistEndpoints = {
  me: {
    list: () => "me/genre-playlists/",
    detail: (uuid: string) => `me/genre-playlists/${uuid}`,
    create: () => "me/genre-playlists",
    update: (uuid: string) => `me/genre-playlists/${uuid}`,
    delete: (uuid: string) => `me/genre-playlists/${uuid}`,
  },
  reference: {
    list: () => "reference/genre-playlists/",
    detail: (uuid: string) => `reference/genre-playlists/${uuid}`,
    create: () => "reference/genre-playlists",
    update: (uuid: string) => `reference/genre-playlists/${uuid}`,
    delete: (uuid: string) => `reference/genre-playlists/${uuid}`,
  },
};
