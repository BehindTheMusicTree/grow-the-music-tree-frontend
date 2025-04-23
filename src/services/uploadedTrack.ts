import { AuthFetch } from "@/hooks/useAuthenticatedApi";
import {
  listUploadedTracks as listUploadedTracksApi,
  updateUploadedTrack as updateUploadedTrackApi,
  downloadTrack as downloadTrackApi,
  TrackData,
  UploadedTrack,
  PaginatedResponse,
} from "@/lib/music-tree-api-service/uploaded-track";

export interface UpdateTrackData extends Partial<TrackData> {}

export class UploadedTrackService {
  constructor(private authFetch: AuthFetch) {}

  async listTracks(): Promise<PaginatedResponse<UploadedTrack>> {
    return listUploadedTracksApi(this.authFetch);
  }

  async updateTrack(trackId: string, data: UpdateTrackData): Promise<UploadedTrack> {
    return updateUploadedTrackApi(this.authFetch, trackId, data as TrackData);
  }

  async downloadTrack(trackId: string): Promise<Response> {
    return downloadTrackApi(this.authFetch, trackId);
  }
}
