import { SpotifyUser } from "@/models/interfaces/spotify";
import { ApiSpotifyUserDto } from "@/types/dto/spotify";

export function mapSpotifyUserDtoToDomain(dto: ApiSpotifyUserDto): SpotifyUser {
  return {
    id: dto.id,
    displayName: dto.display_name,
    email: dto.email,
    imageUrl: dto.images?.[0]?.url,
  };
}
