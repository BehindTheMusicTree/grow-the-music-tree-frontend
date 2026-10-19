"use client";

import { editGenreRecordingPages } from "@behindthemusictree/app-kit/genre-tree";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { RecordingVideoDetailSchema, UpdateRecordingVideoInputSchema } from "@schemas/api/curation";

export function useUpdateRecordingVideo() {
  return useCurationMutation({
    inputSchema: UpdateRecordingVideoInputSchema,
    outputSchema: RecordingVideoDetailSchema,
    request: (fetch, { uuid, video }) =>
      fetch(`library/recordings/${uuid}/`, true, false, { method: "PATCH", body: JSON.stringify(video) }),
    optimistic: (queryClient, { uuid, video }) => {
      queryClient.getQueriesData({ predicate: (query) => query.queryKey[3] === "genre" }).forEach(([key]) => {
        queryClient.setQueryData(key, (data: Parameters<typeof editGenreRecordingPages>[0]) =>
          editGenreRecordingPages(data, (tracks) =>
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
    },
    undo: ({ uuid, video, previous }) => ({ uuid, video: previous, previous: video }),
    message: () => "Video updated",
  });
}
