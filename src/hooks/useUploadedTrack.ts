import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useFetchWrapper } from "./useFetchWrapper";
import { useInvalidateAllGenrePlaylistQueries } from "./useGenrePlaylist";
import { UploadedTrackDetailedSchema } from "@domain/uploaded-track/response/detailed";
import { UploadedTrackSimpleSchema } from "@domain/uploaded-track/response/simple/simple";
import { UploadedTrackCreationSchema } from "@domain/uploaded-track/form/creation";
import { UploadedTrackUpdateSchema } from "@domain/uploaded-track/form/update";
import { PaginatedResponseSchema } from "@schemas/api/paginated-response";
import { useValidatedMutation } from "./useValidatedMutation";

export function useListUploadedTracks(page = 1, pageSize = process.env.NEXT_PUBLIC_UPLOADED_TRACKS_PAGE_SIZE || 50) {
  const { fetch } = useFetchWrapper();

  return useQuery({
    queryKey: ["uploadedTracks", "list", page],
    queryFn: async () => {
      const response = await fetch("library/uploaded/", true, true, {}, { page, pageSize });
      return PaginatedResponseSchema(UploadedTrackSimpleSchema).parse(response);
    },
  });
}

export function useUploadTrack() {
  const queryClient = useQueryClient();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();
  const { fetch } = useFetchWrapper();

  return useValidatedMutation({
    inputSchema: UploadedTrackCreationSchema,
    outputSchema: UploadedTrackDetailedSchema,
    mutationFn: async (data) => {
      const response = await fetch("library/uploaded/", true, true, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
      invalidateAllGenrePlaylistQueries();
    },
  });
}

export function useUpdateUploadedTrack() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();

  const { mutate, formErrors } = useValidatedMutation({
    inputSchema: z.object({
      uuid: z.string(),
      data: UploadedTrackUpdateSchema,
    }),
    outputSchema: UploadedTrackDetailedSchema,
    mutationFn: async ({ uuid, data }) => {
      const response = await fetch(`library/uploaded/${uuid}`, true, true, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks"] });
      queryClient.invalidateQueries({ queryKey: ["uploadedTracks", "detail", uuid] });
      invalidateAllGenrePlaylistQueries();
    },
  });
  return;
}

export function useDownloadTrack(uuid: string) {
  const { fetch } = useFetchWrapper();

  return useQuery({
    queryKey: ["uploadedTracks", "download", uuid],
    queryFn: async () => {
      const response = (await fetch(`library/uploaded/${uuid}/download`, true)) as {
        success: boolean;
        data?: unknown;
        error?: { message?: string };
      };
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to download track");
      }
      return response.data;
    },
    enabled: !!uuid,
  });
}
