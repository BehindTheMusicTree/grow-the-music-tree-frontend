"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { BasePopup } from "@behindthemusictree/app-kit/popup";
import { useFetchWrapper, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import GenrePicker from "@components/features/curation/GenrePicker";
import { BANNER_HEIGHT } from "@lib/constants/layout";
import { PAIRED_LABEL_COLUMNS, curationColumnTitle } from "@lib/curationColumns";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import {
  BOOL_COLUMNS,
  CurationEntrySchema,
  ITEM_ID_COLUMNS,
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
  onClose: () => void;
};

export default function CurationEntryEditor({ list, entry, initialRow, labels, onClose }: Props) {
  const id = useId();
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const [row, setRow] = useState<CurationRow>(() => toCurationRow(list, entry?.row ?? initialRow ?? {}));
  const inputSchema = useMemo(() => z.object({ row: buildCurationRowSchema(list) }), [list]);
  const path = entry ? `curation/${list.name}/entries/${entry.uuid}/` : `curation/${list.name}/entries/`;
  const { mutate, formErrors, isPending } = useValidatedMutation({
    inputSchema,
    outputSchema: CurationEntrySchema,
    mutationFn: (data) =>
      fetch(path, true, false, { method: entry ? "PATCH" : "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      router.refresh();
      onClose();
    },
  });

  const submit = () => mutate({ row });
  const set = (column: string, value: string) => setRow((current) => ({ ...current, [column]: value }));

  const pickGenre = (column: string, itemId: string, name?: string) => {
    const paired = PAIRED_LABEL_COLUMNS[column];
    setRow((current) => ({
      ...current,
      [column]: itemId,
      ...(name && paired && list.columns.includes(paired) ? { [paired]: name } : {}),
    }));
  };

  return (
    <BasePopup
      title={entry ? "Modifier l'entrée" : "Ajouter une entrée"}
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText="Enregistrer"
      cancelButtonText="Annuler"
      okButtonDisabled={isPending}
      onOk={submit}
      onCancel={onClose}
      onClose={onClose}
      className="w-full h-full overflow-y-auto max-md:rounded-none md:w-[40rem] md:h-auto md:max-h-[85vh]"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex flex-col gap-4"
      >
        {list.columns.map((column) => {
          const title = curationColumnTitle(column);
          if (ITEM_ID_COLUMNS.has(column)) {
            const paired = PAIRED_LABEL_COLUMNS[column];
            return (
              <GenrePicker
                key={column}
                label={title}
                value={row[column]}
                defaultText={labels[row[column]] || (paired ? row[paired] : "") || row[column]}
                onChange={(itemId, name) => pickGenre(column, itemId, name)}
              />
            );
          }
          if (BOOL_COLUMNS.has(column)) {
            return (
              <label key={column} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={row[column] === "true"}
                  onChange={(event) => set(column, event.target.checked ? "true" : "")}
                />
                {title}
              </label>
            );
          }
          const Field = column === "reason" ? "textarea" : "input";
          return (
            <div key={column} className="flex flex-col gap-1">
              <label htmlFor={`${id}-${column}`} className="text-sm font-medium text-gray-700">
                {title}
              </label>
              <Field
                id={`${id}-${column}`}
                value={row[column]}
                onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  set(column, event.target.value)
                }
                className="w-full px-3 py-2 border rounded-md"
              />
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
