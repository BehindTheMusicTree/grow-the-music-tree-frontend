export const GENRES_KEY = "genres";
export const REFERENCE_GENRES_KEY = "referenceGenres";
export const MY_GENRES_KEY = "myGenres";
export const LIST_KEY = "list";
export const DETAIL_KEY = "detail";

export const genreEndpoints = {
  list: (isReference = false) => isReference ? "reference/genres/" : "genres/",
  detail: (id: string, isReference = false) => isReference ? `reference/genres/${id}/` : `genres/${id}/`,
  loadTree: (isReference = false) => isReference ? "reference/genres/tree/load/" : "genres/tree/load/",
  create: (isReference = false) => isReference ? "reference/genres" : "genres",
  update: (id: string, isReference = false) => isReference ? `reference/genres/${id}/` : `genres/${id}/`,
  delete: (id: string, isReference = false) => isReference ? `reference/genres/${id}` : `genres/${id}`,
};