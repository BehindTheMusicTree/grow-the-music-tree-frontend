"use client";

import { useGenreCuration } from "@components/features/genre-curation/GenreCurationProvider";
import { MoveRecordingsPopup, UnlinkRecordingsPopup } from "@components/features/genre-curation/RecordingPopups";
import LinkRecordingsDialog from "@components/features/genre-curation/LinkRecordingsDialog";

const BUTTON = "px-3 py-1 text-sm rounded border bg-white cursor-pointer hover:bg-gray-100";

export default function SelectionBar() {
  const { genre, selected, clearSelection, openDialog } = useGenreCuration();
  const recordings = Array.from(selected);

  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 p-2 bg-white border-t">
      {genre && (
        <button
          type="button"
          className={BUTTON}
          onClick={() => openDialog((close) => <LinkRecordingsDialog genre={genre} onClose={close} />)}
        >
          + Link recordings
        </button>
      )}
      {recordings.length > 0 && (
        <>
          <span role="status" className="text-sm font-medium">
            {recordings.length} selected
          </span>
          <button
            type="button"
            className={BUTTON}
            onClick={() =>
              openDialog((close) => (
                <MoveRecordingsPopup recordings={recordings} onClose={close} onDone={clearSelection} />
              ))
            }
          >
            Move to…
          </button>
          <button
            type="button"
            className={BUTTON}
            onClick={() =>
              openDialog((close) => (
                <UnlinkRecordingsPopup recordings={recordings} onClose={close} onDone={clearSelection} />
              ))
            }
          >
            Unlink
          </button>
          <button type="button" aria-label="Clear selection" className={BUTTON} onClick={clearSelection}>
            ✕
          </button>
        </>
      )}
    </div>
  );
}
