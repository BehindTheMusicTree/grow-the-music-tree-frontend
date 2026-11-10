"use client";

import { PanelBleed } from "@behindthemusictree/ui";
import { useGenreCuration } from "@components/features/genre-curation/GenreCurationProvider";
import { MoveSongsPopup, UnlinkSongsPopup } from "@components/features/genre-curation/SongPopups";
import LinkSongsDialog from "@components/features/genre-curation/LinkSongsDialog";

const BUTTON = "px-3 py-1 text-body rounded border bg-white cursor-pointer hover:bg-gray-100";

export default function SelectionBar() {
  const { genre, selected, clearSelection, openDialog } = useGenreCuration();
  const songs = Array.from(selected);

  return (
    <PanelBleed padded className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 py-2 bg-white border-t">
      {genre && (
        <button
          type="button"
          className={BUTTON}
          onClick={() => openDialog((close) => <LinkSongsDialog genre={genre} onClose={close} />)}
        >
          + Link songs
        </button>
      )}
      {songs.length > 0 && (
        <>
          <span role="status" className="text-body font-medium">
            {songs.length} selected
          </span>
          <button
            type="button"
            className={BUTTON}
            onClick={() =>
              openDialog((close) => (
                <MoveSongsPopup songs={songs} onClose={close} onDone={clearSelection} />
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
                <UnlinkSongsPopup songs={songs} onClose={close} onDone={clearSelection} />
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
    </PanelBleed>
  );
}
