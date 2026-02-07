export const playlistQueryKeys = {
  my: {
    all: ["genrePlaylists"] as const,
    list: (page: number) => ["genrePlaylists", "list", page] as const,
    detail: (uuid: string) => ["genrePlaylists", uuid] as const,
  },
  full: {
    all: ["fullGenrePlaylists"] as const,
  },
  reference: {
    all: ["referenceGenrePlaylists"] as const,
  },
};

export const playlistEndpoints = {
  list: (isReference = false) => (isReference ? "reference-genre-playlists/" : "genre-playlists/"),
  detail: (uuid: string, isReference = false) =>
    isReference ? `reference-genre-playlists/${uuid}` : `genre-playlists/${uuid}`,
};
