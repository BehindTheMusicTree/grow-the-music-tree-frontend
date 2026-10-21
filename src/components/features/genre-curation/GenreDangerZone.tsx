"use client";

import { useState } from "react";
import { useDeleteGenre } from "@behindthemusictree/app-kit/genre-tree";
import { BasePopup } from "@behindthemusictree/app-kit-ui/popup";
import GenrePicker from "@components/features/curation/GenrePicker";
import { useGenreCuration } from "@components/features/genre-curation/GenreCurationProvider";
import { useAliasGenre, useAliasPreview } from "@hooks/curation/useAliasGenre";
import { useExcludeGenre } from "@hooks/curation/useExcludeGenre";
import { BANNER_HEIGHT } from "@lib/constants/layout";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { EXCLUDE_CATEGORIES } from "@schemas/api/curation";

type ExcludeCategory = keyof typeof EXCLUDE_CATEGORIES;

interface Genre {
  uuid: string;
  name: string;
  wikidataId?: string | null;
}

interface PopupProps {
  genre: Genre;
  onClose: () => void;
}

interface DangerZoneProps {
  genre: Genre;
  onAliased?: (targetUuid: string) => void;
  onRemoved?: () => void;
}

function AliasPopup({ genre, onClose, onAliased }: PopupProps & Pick<DangerZoneProps, "onAliased">) {
  const [target, setTarget] = useState<{ uuid: string; name: string } | null>(null);
  const preview = useAliasPreview(genre.uuid, target?.uuid ?? null);
  const { mutate, isPending } = useAliasGenre();

  return (
    <BasePopup
      title={`Make ${genre.name} an alias of…`}
      type="warning"
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Merge"
      okButtonDisabled={!target || !preview.data || isPending}
      onOk={() => {
        if (!target) return;
        mutate(
          { uuid: genre.uuid, target: target.uuid },
          {
            onSuccess: () => {
              onClose();
              onAliased?.(target.uuid);
            },
          },
        );
      }}
      onCancel={onClose}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3 min-w-[320px]">
        <GenrePicker
          label="Target genre"
          value={target?.name ?? ""}
          defaultText=""
          onChange={(_itemId, name, uuid) => setTarget(uuid && name ? { uuid, name } : null)}
        />
        {preview.data && (
          <p>
            Moves {preview.data.recordings} recording{preview.data.recordings === 1 ? "" : "s"},{" "}
            {preview.data.essentialTracks} essential track{preview.data.essentialTracks === 1 ? "" : "s"} and{" "}
            {preview.data.children} child genre{preview.data.children === 1 ? "" : "s"} to {target?.name}.
          </p>
        )}
      </div>
    </BasePopup>
  );
}

function ExcludePopup({ genre, onClose, onRemoved }: PopupProps & Pick<DangerZoneProps, "onRemoved">) {
  const [category, setCategory] = useState<ExcludeCategory>("theme");
  const { mutate, isPending } = useExcludeGenre();

  return (
    <BasePopup
      title={`Exclude ${genre.name}`}
      type="warning"
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Exclude"
      okButtonDisabled={isPending}
      onOk={() => {
        mutate(
          { uuid: genre.uuid, category },
          {
            onSuccess: () => {
              onClose();
              onRemoved?.();
            },
          },
        );
      }}
      onCancel={onClose}
      onClose={onClose}
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as ExcludeCategory)}
          className="px-3 py-2 font-normal border rounded-md"
        >
          {(Object.entries(EXCLUDE_CATEGORIES) as [ExcludeCategory, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </BasePopup>
  );
}

function DeletePopup({ genre, onClose, onRemoved }: PopupProps & Pick<DangerZoneProps, "onRemoved">) {
  const { mutate, isPending, formErrors } = useDeleteGenre("reference", getGrowBackendBaseUrl);

  return (
    <BasePopup
      title={`Delete ${genre.name}`}
      type="warning"
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Delete"
      okButtonDisabled={isPending}
      onOk={() =>
        mutate(
          { uuid: genre.uuid },
          {
            onSuccess: () => {
              onClose();
              onRemoved?.();
            },
          },
        )
      }
      onCancel={onClose}
      onClose={onClose}
    >
      <p>This permanently deletes the genre.</p>
      {formErrors.map((error, index) => (
        <p key={index} role="alert" className="text-red-600">
          {error.message}
        </p>
      ))}
    </BasePopup>
  );
}

export default function GenreDangerZone({ genre, onAliased, onRemoved }: DangerZoneProps) {
  const { openDialog } = useGenreCuration();
  const button = "px-3 py-1 text-sm text-red-600 border border-red-300 rounded cursor-pointer hover:bg-red-50";

  return (
    <div className="flex flex-wrap gap-2">
      {!genre.wikidataId && (
        <button type="button" className={button} onClick={() => openDialog((close) => <AliasPopup genre={genre} onClose={close} onAliased={onAliased} />)}>
          Alias of…
        </button>
      )}
      <button type="button" className={button} onClick={() => openDialog((close) => <ExcludePopup genre={genre} onClose={close} onRemoved={onRemoved} />)}>
        Exclude…
      </button>
      <button type="button" className={button} onClick={() => openDialog((close) => <DeletePopup genre={genre} onClose={close} onRemoved={onRemoved} />)}>
        Delete
      </button>
    </div>
  );
}
