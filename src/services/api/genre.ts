import { AuthFetch } from "@/hooks/useAuthenticatedApi";
import { Genre, GenreWithRelations } from "@/models/interfaces/genre";
import { ApiGenreDto, ApiGenreWithRelationsDto } from "@/types/dto/genre";
import { mapGenreDtoToDomain, mapGenreWithRelationsDtoToDomain } from "@/mappers/genre";
import { ApiResponse } from "@/types/api";

export class GenreService {
  constructor(private authFetch: AuthFetch) {}

  async listGenres(page = 1, pageSize = 50): Promise<Genre[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const response = await this.authFetch(`/genres?${params.toString()}`);
    const apiResponse: ApiResponse<ApiGenreDto[]> = await response.json();
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error?.message || "Failed to fetch genres");
    }
    return apiResponse.data.map(mapGenreDtoToDomain);
  }

  async getGenre(id: string): Promise<GenreWithRelations> {
    const response = await this.authFetch(`/genres/${id}`);
    const apiResponse: ApiResponse<ApiGenreWithRelationsDto> = await response.json();
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error?.message || "Failed to fetch genre");
    }
    return mapGenreWithRelationsDtoToDomain(apiResponse.data);
  }

  async createGenre(data: { name: string; description?: string; parentId?: string }): Promise<Genre> {
    const response = await this.authFetch("/genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const apiResponse: ApiResponse<ApiGenreDto> = await response.json();
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error?.message || "Failed to create genre");
    }
    return mapGenreDtoToDomain(apiResponse.data);
  }

  async updateGenre(id: string, data: { name?: string; description?: string; parentId?: string }): Promise<Genre> {
    const response = await this.authFetch(`/genres/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const apiResponse: ApiResponse<ApiGenreDto> = await response.json();
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error?.message || "Failed to update genre");
    }
    return mapGenreDtoToDomain(apiResponse.data);
  }
}
