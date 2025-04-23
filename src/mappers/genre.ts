import { Genre, GenreWithRelations } from "@/models/interfaces/genre";
import { ApiGenreDto, ApiGenreWithRelationsDto } from "@/types/api/genre";

export function mapGenreDtoToDomain(dto: ApiGenreDto): Genre {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    parentId: dto.parent_id,
    createdOn: dto.created_on,
    updatedOn: dto.updated_on,
  };
}

export function mapGenreWithRelationsDtoToDomain(dto: ApiGenreWithRelationsDto): GenreWithRelations {
  return {
    ...mapGenreDtoToDomain(dto),
    parent: dto.parent ? mapGenreDtoToDomain(dto.parent) : undefined,
    children: dto.children?.map(mapGenreDtoToDomain),
  };
}
