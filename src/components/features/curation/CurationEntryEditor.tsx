"use client";

import { Checkbox, Input, Textarea } from "@behindthemusictree/ui";
import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { BasePopup } from "@behindthemusictree/app-kit-ui/popup";
import { useFetchWrapper, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import EntityPicker from "@components/features/curation/EntityPicker";
import GenrePicker from "@components/features/curation/GenrePicker";
import { BANNER_HEIGHT } from "@lib/constants/layout";
import { curationColumnTitle } from "@lib/curationColumns";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import {
  CurationEntrySchema,
  buildCurationRowSchema,
  toCurationRow,
  type CurationEntry,
  type CurationList,
  type CurationRow,
} from "@schemas/api/curation";

type Props = {
  list: CurationList;
  /** Absent when adding an entry. */
  entry?: CurationEntry;
  /** Prefills a new entry, e.g. with the genre it is added for. */
  initialRow?: CurationRow;
  labels: Record<string, string>;
  requireAliasTargetSelection?: boolean;
  onClose: () => void;
};

export default function CurationEntryEditor({
  list, entry, initialRow, labels, requireAliasTargetSelection = false, onClose,
}: Props) {
  const id = useId();
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const isAlias = list.name === "genre_alias" && list.columns.includes("target_item_id");
  const [row, setRow] = useState<CurationRow>(() => {
    const initial = toCurationRow(list, entry?.row ?? initialRow ?? {});
    return isAlias && requireAliasTargetSelection ? { ...initial, target_item_id: "" } : initial;
  });
  const [aliasTargetEdited, setAliasTargetEdited] = useState(false);
  const inputSchema = useMemo(() => {
    const columns = isAlias ? list.columnSpecs.filter(({ name }) => name !== "wikidata_genre_name") : list.columnSpecs;
    return z.object({ row: buildCurationRowSchema({ ...list, columnSpecs: columns }) });
  }, [isAlias, list]);
  const path = entry ? `curation/${list.name}/entries/${entry.uuid}/` : `curation/${list.name}/entries/`;
  const { mutate, formErrors, isPending } = useValidatedMutation({
    inputSchema,
    outputSchema: CurationEntrySchema,
    mutationFn: (data) => fetch(path, true, false, { method: entry ? "PATCH" : "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      router.refresh();
      onClose();
    },
  });

  const submit = () => mutate({ row });
  const requiresAliasTarget = isAlias && !row.target_item_id && (
    requireAliasTargetSelection || !entry || !!entry.row.target_item_id || aliasTargetEdited ||
    row.musicbrainz_genre_name !== entry.row.musicbrainz_genre_name
  );
  const set = (column: string, value: string) => setRow((current) => ({ ...current, [column]: value }));

  return (
    <BasePopup
      title={entry ? "Modifier l'entrée" : "Ajouter une entrée"}
      topOffset={BANNER_HEIGHT}
      isDismissable
      trapFocus
      showOkButton
      showCancelButton
      okButtonText="Enregistrer"
      cancelButtonText="Annuler"
      okButtonDisabled={isPending || requiresAliasTarget}
      onOk={submit}
      onCancel={onClose}
      onClose={onClose}
      className="w-full h-full overflow-y-auto max-md:rounded-none md:w-[40rem] md:h-auto md:max-h-[85vh]"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!requiresAliasTarget) submit();
        }}
        className="flex flex-col gap-4"
      >
        {list.columnSpecs.map(({ name: column, kind }) => {
          if (isAlias && column === "wikidata_genre_name") return null;
          const title = curationColumnTitle(column);
          if (kind === "item_id") {
            return (
              <GenrePicker
                key={column}
                label={title}
                value={row[column]}
                defaultText={labels[row[column]] || (isAlias ? row.wikidata_genre_name : "") || row[column]}
                onChange={(itemId) => set(column, itemId)}
                catalog={!isAlias}
                aliasTargets={isAlias}
                onTextEdit={(text) => setAliasTargetEdited(text !== entry?.row.wikidata_genre_name)}
              />
            );
          }
          if (kind === "entity_id") {
            return (
              <EntityPicker
                key={column}
                label={title}
                value={row[column]}
                onChange={(entityId) => set(column, entityId)}
              />
            );
          }
          if (kind === "bool") {
            return (
              <label key={column} className="flex items-center gap-2 text-body font-medium text-gray-700">
                <Checkbox
                  checked={row[column] === "true"}
                  onChange={(event) => set(column, event.target.checked ? "true" : "")}
                />
                {title}
              </label>
            );
          }
          const fieldProps = {
            id: `${id}-${column}`,
            value: row[column],
          };
          return (
            <div key={column} className="flex flex-col gap-1">
              <label htmlFor={`${id}-${column}`} className="text-body font-medium text-gray-700">
                {title}
              </label>
              {column === "reason" ? (
                <Textarea {...fieldProps} onChange={(event) => set(column, event.target.value)} />
              ) : (
                <Input {...fieldProps} onChange={(event) => set(column, event.target.value)} />
              )}
            </div>
          );
        })}
        {formErrors.length > 0 && (
          <div role="alert" className="flex flex-col gap-1 text-red-500">
            {formErrors.map((error, index) => (
              <p key={index}>
                {error.field.startsWith("row.") ? `${curationColumnTitle(error.field.slice(4))} : ` : ""}
                {error.message}
              </p>
            ))}
          </div>
        )}
        <button type="submit" hidden />
      </form>
    </BasePopup>
  );
}
