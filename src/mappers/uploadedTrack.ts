import { UploadedTrack } from "@/types/domain/uploadedTrack";
import { ApiUploadedTrackDto } from "@/types/api/uploadedTrack";

export function mapUploadedTrackDtoToDomain(dto: ApiUploadedTrackDto): UploadedTrack {
  return {
    id: dto.id,
    title: dto.title,
    artist: dto.artist,
    album: dto.album,
    genre: dto.genre,
    rating: dto.rating,
    file: dto.file,
    playCount: dto.playCount,
    createdAt: new Date(dto.created_on),
    updatedAt: new Date(dto.updated_on),
  };
}
