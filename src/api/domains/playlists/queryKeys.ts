export const playlistQueryKeys = {
  me: {
    all: ["meGenrePlaylists"] as const,
    list: (page: number) => ["meGenrePlaylists", "list", page] as const,
    full: ["meGenrePlaylists", "full"] as const,
    detail: (uuid: string) => ["meGenrePlaylists", uuid] as const,
  },
  reference: {
    all: ["referenceGenrePlaylists"] as const,
    list: (page: number) => ["referenceGenrePlaylists", "list", page] as const,
    full: ["referenceGenrePlaylists", "full"] as const,
    detail: (uuid: string) => ["referenceGenrePlaylists", uuid] as const,
  },
};
