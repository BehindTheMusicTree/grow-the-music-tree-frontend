"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { YOUTUBE_UNPLAYABLE_REASON_LABELS } from "@behindthemusictree/app-kit/genre-tree";
import { BasePopup } from "@behindthemusictree/app-kit-ui/popup";
import { useFetchWrapper } from "@behindthemusictree/app-kit/transport";
import { RingLoader } from "@behindthemusictree/ui";
import { useUpdateRecordingVideo } from "@hooks/curation/useUpdateRecordingVideo";
import { BANNER_HEIGHT } from "@lib/constants/layout";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { RecordingVideoDetailSchema } from "@schemas/api/curation";
import { extractYoutubeId } from "@utils/youtubeId";

interface Props {
  recording: { uuid: string; title: string };
  onClose: () => void;
}

export default function RecordingVideoDialog({ recording, onClose }: Props) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const { data, isLoading } = useQuery({
    queryKey: ["referenceRecordings", "detail", recording.uuid],
    queryFn: async () =>
      RecordingVideoDetailSchema.parse(await fetch(`library/recordings/${recording.uuid}/`, true, false)),
  });
  const { mutate, isPending } = useUpdateRecordingVideo();

  return (
    <BasePopup title={`Video for ${recording.title}`} topOffset={BANNER_HEIGHT} isDismissable onClose={onClose}>
      {isLoading || !data ? (
        <RingLoader />
      ) : (
        <VideoForm
          key={data.uuid}
          recordingUuid={recording.uuid}
          current={{
            youtubeVideoId: data.youtubeVideoId ?? null,
            youtubeUnplayableReason: data.youtubeUnplayableReason ?? null,
          }}
          isPending={isPending}
          onSave={(video, previous) => {
            mutate({ uuid: recording.uuid, video, previous }, { onSuccess: onClose });
          }}
          onCancel={onClose}
        />
      )}
    </BasePopup>
  );
}

interface VideoFormProps {
  recordingUuid: string;
  current: { youtubeVideoId: string | null; youtubeUnplayableReason: string | null };
  isPending: boolean;
  onSave: (
    video: { youtubeVideoId: string | null; youtubeUnplayableReason: string | null },
    previous: VideoFormProps["current"],
  ) => void;
  onCancel: () => void;
}

export function VideoForm({ current, isPending, onSave, onCancel }: VideoFormProps) {
  const [text, setText] = useState(current.youtubeVideoId ?? "");
  const [reason, setReason] = useState(current.youtubeUnplayableReason ?? "");
  const videoId = extractYoutubeId(text);
  const invalid = text.trim() !== "" && videoId === null;

  return (
    <form
      className="flex flex-col gap-3 min-w-[320px]"
      onSubmit={(event) => {
        event.preventDefault();
        if (!invalid) onSave({ youtubeVideoId: videoId, youtubeUnplayableReason: reason || null }, current);
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        YouTube URL or ID
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="w-full px-3 py-2 font-normal border rounded-md"
        />
      </label>
      {invalid && (
        <p role="alert" className="text-red-600">
          Not a YouTube link or video ID.
        </p>
      )}
      {videoId && (
        <iframe
          title="Video preview"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          className="w-full aspect-video"
          allow="encrypted-media"
        />
      )}
      <label className="flex flex-col gap-1 text-sm font-medium">
        Unplayable reason
        <select
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="px-3 py-2 font-normal border rounded-md"
        >
          <option value="">None</option>
          {Object.entries(YOUTUBE_UNPLAYABLE_REASON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex justify-end gap-3">
        {current.youtubeVideoId && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onSave({ youtubeVideoId: null, youtubeUnplayableReason: null }, current)}
            className="px-4 py-2 text-red-600 border rounded cursor-pointer hover:bg-gray-100 disabled:opacity-50"
          >
            Remove video
          </button>
        )}
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded cursor-pointer hover:bg-gray-100">
          Cancel
        </button>
        <button
          type="submit"
          disabled={invalid || isPending}
          className="px-4 py-2 text-white bg-blue-600 rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}
