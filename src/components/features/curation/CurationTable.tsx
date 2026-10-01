"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@behindthemusictree/ui";
import { useFetchWrapper, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import {
  BOOL_COLUMNS,
  CurationEntrySchema,
  buildCurationRowSchema,
  toCurationRow,
  type CurationEntry,
  type CurationList,
  type CurationRow,
} from "@schemas/api/curation";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

type FieldError = { field: string; message: string };

function useRowMutation(list: CurationList, method: "POST" | "PATCH", path: string, onSuccess: () => void) {
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const inputSchema = useMemo(() => z.object({ row: buildCurationRowSchema(list) }), [list]);
  return useValidatedMutation({
    inputSchema,
    outputSchema: CurationEntrySchema,
    mutationFn: (data) => fetch(path, true, false, { method, body: JSON.stringify(data) }),
    onSuccess: () => {
      onSuccess();
      router.refresh();
    },
  });
}

function RowInputs({
  list,
  row,
  onChange,
}: {
  list: CurationList;
  row: CurationRow;
  onChange: (row: CurationRow) => void;
}) {
  return list.columns.map((column) => (
    <td key={column} className="p-1">
      {BOOL_COLUMNS.has(column) ? (
        <input
          type="checkbox"
          aria-label={column}
          checked={row[column] === "true"}
          onChange={(event) => onChange({ ...row, [column]: event.target.checked ? "true" : "" })}
        />
      ) : (
        <input
          aria-label={column}
          value={row[column]}
          onChange={(event) => onChange({ ...row, [column]: event.target.value })}
          className="w-full rounded border px-2 py-1"
        />
      )}
    </td>
  ));
}

function ErrorRow({ list, errors }: { list: CurationList; errors: FieldError[] }) {
  if (errors.length === 0) return null;
  return (
    <tr>
      <td colSpan={list.columns.length + 1} className="p-1 text-red-500">
        {errors.map((error, index) => (
          <p key={index}>
            {error.field.startsWith("row.") ? `${error.field.slice(4)}: ` : ""}
            {error.message}
          </p>
        ))}
      </td>
    </tr>
  );
}

function EntryRow({ list, entry }: { list: CurationList; entry: CurationEntry }) {
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const saved = toCurationRow(list, entry.row);
  const [draft, setDraft] = useState<CurationRow | null>(null);
  const path = `curation/${list.name}/entries/${entry.uuid}/`;
  const save = useRowMutation(list, "PATCH", path, () => setDraft(null));
  const remove = useValidatedMutation({
    inputSchema: z.null(),
    outputSchema: z.null(),
    mutationFn: () => fetch(path, true, false, { method: "DELETE" }),
    onSuccess: () => router.refresh(),
  });
  const isPending = save.isPending || remove.isPending;

  return (
    <>
      <tr className="border-t">
        {draft ? (
          <RowInputs list={list} row={draft} onChange={setDraft} />
        ) : (
          list.columns.map((column) => (
            <td key={column} className="p-1">
              {BOOL_COLUMNS.has(column) ? (
                <input type="checkbox" aria-label={column} checked={saved[column] === "true"} disabled />
              ) : (
                saved[column]
              )}
            </td>
          ))
        )}
        <td className="flex gap-2 p-1">
          {draft ? (
            <>
              <Button onClick={() => save.mutate({ row: draft })} disabled={isPending}>
                Save
              </Button>
              <Button onClick={() => setDraft(null)} disabled={isPending}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setDraft(saved)} disabled={isPending}>
              Edit
            </Button>
          )}
          <Button
            onClick={() =>
              window.confirm(`Delete ${list.keyColumns.map((c) => saved[c]).join(" / ")}?`) && remove.mutate(null)
            }
            disabled={isPending}
          >
            Delete
          </Button>
        </td>
      </tr>
      <ErrorRow list={list} errors={[...save.formErrors, ...remove.formErrors]} />
    </>
  );
}

function NewEntryRow({ list }: { list: CurationList }) {
  const empty = useMemo(() => toCurationRow(list, {}), [list]);
  const [draft, setDraft] = useState(empty);
  const add = useRowMutation(list, "POST", `curation/${list.name}/entries/`, () => setDraft(empty));

  return (
    <>
      <tr className="border-t">
        <RowInputs list={list} row={draft} onChange={setDraft} />
        <td className="p-1">
          <Button onClick={() => add.mutate({ row: draft })} disabled={add.isPending}>
            Add
          </Button>
        </td>
      </tr>
      <ErrorRow list={list} errors={add.formErrors} />
    </>
  );
}

export default function CurationTable({ list, entries }: { list: CurationList; entries: CurationEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            {list.columns.map((column) => (
              <th key={column} className="p-1">
                {column}
              </th>
            ))}
            <th className="p-1">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <NewEntryRow list={list} />
          {entries.map((entry) => (
            <EntryRow key={entry.uuid} list={list} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
