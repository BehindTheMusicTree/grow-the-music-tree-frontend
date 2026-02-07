import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useFetchWrapper } from "./useFetchWrapper";
import { useInvalidateAllGenrePlaylistQueries } from "./useGenrePlaylist";
import { UploadedTrackDetailedSchema } from "@domain/uploaded-track/response/detailed";
import { UploadedTrackCreationSchema } from "@domain/uploaded-track/form/creation";
import { UploadedTrackUpdateSchema } from "@domain/uploaded-track/form/update";
import { PaginatedResponseSchema } from "@schemas/api/paginated-response";
import { useValidatedMutation } from "./useValidatedMutation";
import { libraryEndpoints, libraryQueryKeys } from "../api/endpoints/library.contract";

export function useListUploadedTracks(page = 1, pageSize = process.env.NEXT_PUBLIC_UPLOADED_TRACKS_PAGE_SIZE || 50) {
  const { fetch } = useFetchWrapper();

  return useQuery({
    queryKey: libraryQueryKeys.me.uploaded.list(page),
    queryFn: async () => {
      const response = await fetch(libraryEndpoints.me.uploaded.list(), false, true, {}, { page, pageSize });
      const result = PaginatedResponseSchema(UploadedTrackDetailedSchema).safeParse(response);
      if (!result.success) {
        console.error("Parsing failed:", result.error);
        throw result.error;
      }
      return result.data;
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
      const formData = new FormData();
      formData.append("file", data.file);

      if (data.track_file_fingerprint_must_be_unique !== undefined) {
        formData.append("track_file_fingerprint_must_be_unique", String(data.track_file_fingerprint_must_be_unique));
      }
      if (data.title !== undefined && data.title !== null) {
        formData.append("title", data.title);
      }
      if (data.force_title_generation !== undefined) {
        formData.append("force_title_generation", String(data.force_title_generation));
      }
      if (data.artists_names !== undefined && data.artists_names !== null) {
        formData.append("artists_names", data.artists_names);
      }
      if (data.album_name !== undefined && data.album_name !== null) {
        formData.append("album_name", data.album_name);
      }
      if (data.album_artists_names !== undefined && data.album_artists_names !== null) {
        formData.append("album_artists_names", data.album_artists_names);
      }
      if (data.track_number !== undefined) {
        formData.append("track_number", String(data.track_number));
      }
      if (data.genre !== undefined && data.genre !== null) {
        formData.append("genre", data.genre);
      }
      if (data.rating !== undefined) {
        formData.append("rating", String(data.rating));
      }
      if (data.language !== undefined && data.language !== null) {
        formData.append("language", data.language);
      }

      const response = await fetch(libraryEndpoints.me.uploaded.create(), false, true, {
        method: "POST",
        body: formData,
        headers: {
          // Remove Content-Type header to let browser set it with boundary for FormData
        },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryQueryKeys.me.uploaded.all });
      invalidateAllGenrePlaylistQueries();
    },
  });
}

export function useUpdateUploadedTrack() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();

  const mutation = useValidatedMutation({
    inputSchema: z.object({
      uuid: z.string(),
      data: UploadedTrackUpdateSchema,
    }),
    outputSchema: UploadedTrackDetailedSchema,
    mutationFn: async ({ uuid, data }) => {
      const response = await fetch(libraryEndpoints.me.uploaded.update(uuid), false, true, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      // Handle case where API returns null
      if (response === null) {
        throw new Error("API returned null response");
      }

      return response;
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: libraryQueryKeys.me.uploaded.all });
      queryClient.invalidateQueries({ queryKey: libraryQueryKeys.me.uploaded.detail(uuid) });
      invalidateAllGenrePlaylistQueries();
    },
  });
  return mutation;
}

export function useDownloadTrack(uuid: string) {
  const { fetch } = useFetchWrapper();

  return useQuery({
    queryKey: libraryQueryKeys.me.uploaded.download(uuid),
    queryFn: async () => {
      const response = await fetch(libraryEndpoints.me.uploaded.download(uuid), false, true, {}, {});

      return response;
    },
    enabled: !!uuid,
  });
}
