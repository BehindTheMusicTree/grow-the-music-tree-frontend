import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper } from "./useFetchWrapper";
import { UploadedTrackCreationValues, UploadedTrackUpdateValues } from "@schemas/uploaded-track/form";

export function useListUploadedTracks() {
  const { fetch } = useFetchWrapper();

  return useQuery({
    queryKey: ["uploadedTracks"],
    queryFn: async () => {
      const response = await fetch("uploaded-track/", true);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to fetch uploaded tracks");
      }
      return response.data.results;
    },
  });
}

export function useUploadTrack() {
  const { fetch } = useFetchWrapper();
  return useMutation({
    mutationFn: async (uploadedTrackCreationValues: UploadedTrackCreationValues) => {
      const response = await fetch("uploaded-track/", true, true, {
        method: "POST",
        body: JSON.stringify(uploadedTrackCreationValues),
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to upload track");
      }
      return response.data;
    },
  });
}

export function useUpdateUploadedTrack() {
  const { fetch } = useFetchWrapper();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid: uuid, data }: { uuid: string; data: UploadedTrackUpdateValues }) => {
      const response = await fetch(`uploaded-tracks/${uuid}`, true, true, {
        method: "PUT",
        body: JSON.stringify(data),
      });
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
  const { fetch } = useFetchWrapper();

  return async (uuid: string): Promise<Response> => {
    const response = await fetch(`uploaded-tracks/${uuid}/download`, true);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Failed to download track");
    }
    return response.data;
  };
}
