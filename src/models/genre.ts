import { UuidResource } from "./interfaces/base";

export interface Genre extends UuidResource {
  name: string;
  description?: string;
  parentId?: string;
}

// For creating/updating genres
export type GenreInput = Omit<Genre, keyof UuidResource>;

// For forms
export interface GenreFormData extends GenreInput {
  parentName?: string;
}

// For API responses
export interface GenreWithRelations extends Genre {
  parent?: Genre;
  children?: Genre[];
}
