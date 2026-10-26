"use client";

import { useState } from "react";
import { BasePopup } from "@behindthemusictree/app-kit-ui/popup";
import GenrePicker from "@components/features/curation/GenrePicker";
import { useAssignSongGenre } from "@hooks/curation/useAssignSongGenre";
import { BANNER_HEIGHT } from "@lib/constants/layout";

interface PopupProps {
  songs: string[];
  onClose: () => void;
  onDone?: () => void;
}

export function MoveSongsPopup({ songs, onClose, onDone }: PopupProps) {
  const [target, setTarget] = useState<{ uuid: string; name: string } | null>(null);
  const { mutate, isPending } = useAssignSongGenre("moved");

  return (
    <BasePopup
      title={`Move ${songs.length} song${songs.length > 1 ? "s" : ""} to…`}
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Move"
      okButtonDisabled={!target || isPending}
      onOk={() => {
        if (!target) return;
        mutate(
          { songs, genre: target.uuid },
          {
            onSuccess: () => {
              onDone?.();
              onClose();
            },
          },
        );
      }}
      onCancel={onClose}
      onClose={onClose}
    >
      <GenrePicker
        label="Target genre"
        excludeUmbrellas
        value={target?.name ?? ""}
        defaultText=""
        onChange={(_itemId, name, uuid) => setTarget(uuid && name ? { uuid, name } : null)}
      />
    </BasePopup>
  );
}

export function UnlinkSongsPopup({ songs, onClose, onDone }: PopupProps) {
  const { mutate, isPending } = useAssignSongGenre("unlinked");

  return (
    <BasePopup
      title="Unlink songs"
      type="warning"
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Unlink"
      okButtonDisabled={isPending}
      onOk={() => {
        mutate(
          { songs, genre: null },
          {
            onSuccess: () => {
              onDone?.();
              onClose();
            },
          },
        );
      }}
      onCancel={onClose}
      onClose={onClose}
    >
      <p>
        {songs.length} song{songs.length > 1 ? "s" : ""} will lose their genre.
      </p>
    </BasePopup>
  );
}
