import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedApi, AuthFetch } from "./useAuthenticatedApi";
import { UploadedTrackService } from "@/services/uploadedTrack";
import { UploadedTrack, PaginatedResponse, TrackData } from "@lib/music-tree-api-service/uploaded-track";

const uploadedTrackService = (authFetch: AuthFetch) => new UploadedTrackService(authFetch);

export function useListUploadedTracks() {
  const listTracks = useAuthenticatedApi<PaginatedResponse<UploadedTrack>>((authFetch) =>
    uploadedTrackService(authFetch).listTracks()
  );

  return useQuery({
    queryKey: ["uploadedTracks"],
    queryFn: async () => {
      const response = await listTracks();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to fetch uploaded tracks");
      }
      return response.data.results;
    },
  });
}

export function useUpdateUploadedTrack() {
  const queryClient = useQueryClient();
  const updateTrack = useAuthenticatedApi<UploadedTrack, [string, Partial<TrackData>]>((authFetch, trackId, data) =>
    uploadedTrackService(authFetch).updateTrack(trackId, data)
  );

  return useMutation({
    mutationFn: async ({ trackId, data }: { trackId: string; data: Partial<TrackData> }) => {
      const response = await updateTrack(trackId, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to update track");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
    },
  });
}

export function useDownloadTrack() {
  const downloadTrack = useAuthenticatedApi<Response, [string]>((authFetch, trackId) =>
    uploadedTrackService(authFetch).downloadTrack(trackId)
  );

  return async (trackId: string): Promise<Response> => {
    const response = await downloadTrack(trackId);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Failed to download track");
    }
    return response.data;
  };
}
