import { AuthFetch } from "@/hooks/useAuthenticatedApi";
import { UploadedTrack, TrackData } from "@/types/domain/uploadedTrack";
import { ApiUploadedTrackDto } from "@/types/dto/uploadedTrack";
import { mapUploadedTrackDtoToDomain } from "@/mappers/uploaded-track";
import { ApiResponse } from "@/types/api";

export class UploadedTrackService {
  constructor(private authFetch: AuthFetch) {}

  async listTracks(page = 1, pageSize = 50): Promise<UploadedTrack[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const response = await this.authFetch(`/uploaded-tracks?${params.toString()}`);
    const apiResponse: ApiResponse<ApiUploadedTrackDto[]> = await response.json();
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error?.message || "Failed to fetch uploaded tracks");
    }
    return apiResponse.data.map(mapUploadedTrackDtoToDomain);
  }

  async updateTrack(trackId: string, data: Partial<TrackData>): Promise<UploadedTrack> {
    const response = await this.authFetch(`/uploaded-tracks/${trackId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const apiResponse: ApiResponse<ApiUploadedTrackDto> = await response.json();
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error?.message || "Failed to update track");
    }
    return mapUploadedTrackDtoToDomain(apiResponse.data);
  }

  async downloadTrack(trackId: string): Promise<Response> {
    const response = await this.authFetch(`/uploaded-tracks/${trackId}/download`);
    if (!response.ok) {
      throw new Error("Failed to download track");
    }
    return response;
  }
}
