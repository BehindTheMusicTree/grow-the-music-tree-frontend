export interface ApiGenreDto {
  id: string;
  name: string;
  parent_id?: string;
  created_on: string;
  updated_on: string;
}

export interface ApiGenreWithRelationsDto extends ApiGenreDto {
  parent?: ApiGenreDto;
  children?: ApiGenreDto[];
}

export type ApiGenreInputDto = Pick<ApiGenreDto, "name" | "parent_id">;
