export const genreEndpoints = {
  me: {
    list: () => "me/genres/",
    detail: (id: string) => `me/genres/${id}/`,
    loadExampleTree: () => "me/genres/tree/load-example/",
    create: () => "me/genres",
    update: (id: string) => `me/genres/${id}/`,
    delete: (id: string) => `me/genres/${id}`,
  },
  reference: {
    list: () => "reference/genres/",
    detail: (id: string) => `reference/genres/${id}/`,
    loadExampleTree: () => "reference/genres/tree/load-example/",
    create: () => "reference/genres",
    update: (id: string) => `reference/genres/${id}/`,
    delete: (id: string) => `reference/genres/${id}`,
  },
};
