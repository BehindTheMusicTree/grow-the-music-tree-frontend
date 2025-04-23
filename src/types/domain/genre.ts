import { UuidResource } from "./base";

export interface Genre extends UuidResource {
  name: string;
  description?: string;
  parentId?: string;
}

export interface GenreWithRelations extends Genre {
  parent?: Genre;
  children?: Genre[];
}
