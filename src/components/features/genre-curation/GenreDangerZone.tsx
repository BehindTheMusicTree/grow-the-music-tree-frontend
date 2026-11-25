"use client";

import { useState } from "react";
import { useDeleteGenre, type GenreUuid } from "@behindthemusictree/app-kit/genre-tree";
import { ActionBand, ActionButton, PanelBleed, Select } from "@behindthemusictree/ui";
import { ArrowUpToLine, Ban, Merge, Trash2, type LucideIcon } from "lucide-react";
import { BasePopup } from "@behindthemusictree/app-kit-ui/popup";
import GenrePicker from "@components/features/curation/GenrePicker";
import { useGenreCuration } from "@components/features/genre-curation/GenreCurationProvider";
import { useAliasGenre, useAliasPreview } from "@hooks/curation/useAliasGenre";
import { useExcludeGenre } from "@hooks/curation/useExcludeGenre";
import { useSetGenreRoot } from "@hooks/curation/useSetGenreRoot";
import { BANNER_HEIGHT } from "@lib/constants/layout";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { EXCLUDE_CATEGORIES } from "@schemas/api/curation";

type ExcludeCategory = keyof typeof EXCLUDE_CATEGORIES;

interface Genre {
  uuid: GenreUuid;
  name: string;
  wikidataId?: string | null;
}

interface PopupProps {
  genre: Genre;
  onClose: () => void;
}

interface DangerZoneProps {
  genre: Genre;
  parent?: { uuid: string; name: string } | null;
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
            Moves {preview.data.songs} song{preview.data.songs === 1 ? "" : "s"},{" "}
            {preview.data.essentialSongs} essential song{preview.data.essentialSongs === 1 ? "" : "s"} and{" "}
            {preview.data.children} child genre{preview.data.children === 1 ? "" : "s"} to {target?.name}.
          </p>
        )}
      </div>
    </BasePopup>
  );
}

function SetRootPopup({ genre, parent, onClose }: PopupProps & { parent: { name: string } }) {
  const { mutate, isPending } = useSetGenreRoot();

  return (
    <BasePopup
      title={`Set ${genre.name} as root`}
      type="warning"
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Set as root"
      okButtonDisabled={isPending}
      onOk={() => mutate({ uuid: genre.uuid, name: genre.name }, { onSuccess: onClose })}
      onCancel={onClose}
      onClose={onClose}
    >
      <p className="max-w-md">
        {genre.name} and its descendants will no longer be under {parent.name}. It stays a root on every
        import.
      </p>
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
      <label className="flex flex-col gap-1 text-body font-medium">
        Category
        <Select
          value={category}
          onChange={(event) => setCategory(event.target.value as ExcludeCategory)}
        >
          {(Object.entries(EXCLUDE_CATEGORIES) as [ExcludeCategory, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
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

export default function GenreDangerZone({ genre, parent, onAliased, onRemoved }: DangerZoneProps) {
  const { openDialog } = useGenreCuration();
  const icon = (Icon: LucideIcon) => <Icon size={18} className="text-red-600" />;

  return (
    <PanelBleed>
      <ActionBand
        section={{
          title: "Danger zone",
          children: (
            <>
              {!genre.wikidataId && (
                <ActionButton
                  icon={icon(Merge)}
                  label="Alias"
                  aria-label="Alias of…"
                  onClick={() => openDialog((close) => <AliasPopup genre={genre} onClose={close} onAliased={onAliased} />)}
                />
              )}
              {parent && (
                <ActionButton
                  icon={icon(ArrowUpToLine)}
                  label="Root"
                  aria-label="Set as root…"
                  onClick={() => openDialog((close) => <SetRootPopup genre={genre} parent={parent} onClose={close} />)}
                />
              )}
              <ActionButton
                icon={icon(Ban)}
                label="Exclude"
                aria-label="Exclude…"
                onClick={() => openDialog((close) => <ExcludePopup genre={genre} onClose={close} onRemoved={onRemoved} />)}
              />
              <ActionButton
                icon={icon(Trash2)}
                label="Delete"
                onClick={() => openDialog((close) => <DeletePopup genre={genre} onClose={close} onRemoved={onRemoved} />)}
              />
            </>
          ),
        }}
      />
    </PanelBleed>
  );
}
