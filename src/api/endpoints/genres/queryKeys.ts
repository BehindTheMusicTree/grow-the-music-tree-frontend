export const genreQueryKeys = {
  me: {
    all: ["genres"] as const,
    list: (page: number) => ["genres", "list", page] as const,
    detail: (id: string) => ["genres", "detail", id] as const,
  },
  reference: {
    all: ["referenceGenres"] as const,
    list: (page: number) => ["referenceGenres", "list", page] as const,
    detail: (id: string) => ["referenceGenres", "detail", id] as const,
  },
};
