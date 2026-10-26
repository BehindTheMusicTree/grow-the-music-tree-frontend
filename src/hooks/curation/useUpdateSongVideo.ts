"use client";

import { editGenreSongPages, libraryQueryKeys } from "@behindthemusictree/app-kit/genre-tree";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { SongVideoDetailSchema, UpdateSongVideoInputSchema } from "@schemas/api/curation";

export function useUpdateSongVideo() {
  return useCurationMutation({
    inputSchema: UpdateSongVideoInputSchema,
    outputSchema: SongVideoDetailSchema,
    request: (fetch, { uuid, video }) =>
      fetch(`library/songs/${uuid}/`, true, false, { method: "PATCH", body: JSON.stringify(video) }),
    optimistic: (queryClient, { uuid, video }) => {
      const prefix = libraryQueryKeys.reference.songs.all[0];
      const keys = queryClient.getQueriesData({ queryKey: [prefix, getGrowBackendBaseUrl(), "genre"] }).map(([key]) => key);
      keys.forEach((key) => {
        queryClient.setQueryData(key, (data: Parameters<typeof editGenreSongPages>[0]) =>
          editGenreSongPages(data, (tracks) =>
            tracks.map((track) =>
              (track as { uuid: string }).uuid === uuid
                ? {
                    ...(track as object),
                    youtubeVideoId: video.youtubeVideoId,
                    youtubeUnplayableReason: video.youtubeUnplayableReason,
                  }
                : track,
            ),
          ),
        );
      });
      return keys;
    },
    undo: ({ uuid, video, previous }) => ({ uuid, video: previous, previous: video }),
    message: () => "Video updated",
    pendingLabel: () => "Updating video…",
  });
}
