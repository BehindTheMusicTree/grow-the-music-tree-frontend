import { ApiGenreDto, ApiGenreWithRelationsDto } from "../types/api/genre";
import { Genre } from "../types/domain/genre";

export function mapGenreDtoToDomain(dto: ApiGenreDto): Genre {
  const genre = new Genre();
  genre.id = dto.id;
  genre.name = dto.name;
  genre.parentId = dto.parent_id;
  genre.createdAt = new Date(dto.created_on);
  genre.updatedAt = new Date(dto.updated_on);
  return genre;
}

export function mapGenreWithRelationsDtoToDomain(dto: ApiGenreWithRelationsDto): Genre {
  const genre = mapGenreDtoToDomain(dto);
  if (dto.parent) {
    genre.parent = mapGenreDtoToDomain(dto.parent);
  }
  if (dto.children) {
    genre.children = dto.children.map((child) => mapGenreDtoToDomain(child));
  }
  return genre;
}
