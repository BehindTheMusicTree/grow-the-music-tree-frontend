"use client";

import { useState } from "react";
import { BasePopup } from "@behindthemusictree/app-kit/popup";
import GenrePicker from "@components/features/curation/GenrePicker";
import { useAssignRecordingGenre } from "@hooks/curation/useAssignRecordingGenre";
import { BANNER_HEIGHT } from "@lib/constants/layout";

interface PopupProps {
  recordings: string[];
  onClose: () => void;
  onDone?: () => void;
}

export function MoveRecordingsPopup({ recordings, onClose, onDone }: PopupProps) {
  const [target, setTarget] = useState<{ uuid: string; name: string } | null>(null);
  const { mutate, isPending } = useAssignRecordingGenre("moved");

  return (
    <BasePopup
      title={`Move ${recordings.length} recording${recordings.length > 1 ? "s" : ""} to…`}
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Move"
      okButtonDisabled={!target || isPending}
      onOk={() => {
        if (!target) return;
        mutate({ recordings, genre: target.uuid });
        onDone?.();
        onClose();
      }}
      onCancel={onClose}
      onClose={onClose}
    >
      <GenrePicker
        label="Target genre"
        value={target?.name ?? ""}
        defaultText=""
        onChange={(_itemId, name, uuid) => setTarget(uuid && name ? { uuid, name } : null)}
      />
    </BasePopup>
  );
}

export function UnlinkRecordingsPopup({ recordings, onClose, onDone }: PopupProps) {
  const { mutate, isPending } = useAssignRecordingGenre("unlinked");

  return (
    <BasePopup
      title="Unlink recordings"
      type="warning"
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Unlink"
      okButtonDisabled={isPending}
      onOk={() => {
        mutate({ recordings, genre: null });
        onDone?.();
        onClose();
      }}
      onCancel={onClose}
      onClose={onClose}
    >
      <p>
        {recordings.length} recording{recordings.length > 1 ? "s" : ""} will lose their genre.
      </p>
    </BasePopup>
  );
}
