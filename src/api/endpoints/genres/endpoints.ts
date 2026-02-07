export const genreEndpoints = {
  me: {
    list: () => "me/genres/",
    detail: (id: string) => `me/genres/${id}/`,
    loadTree: () => "me/genres/tree/load/",
    create: () => "me/genres",
    update: (id: string) => `me/genres/${id}/`,
    delete: (id: string) => `me/genres/${id}`,
  },
  reference: {
    list: () => "reference/genres/",
    detail: (id: string) => `reference/genres/${id}/`,
    loadTree: () => "reference/genres/tree/load/",
    create: () => "reference/genres",
    update: (id: string) => `reference/genres/${id}/`,
    delete: (id: string) => `reference/genres/${id}`,
  },
};
