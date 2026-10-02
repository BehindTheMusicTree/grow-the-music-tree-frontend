"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Button, Pagination } from "@behindthemusictree/ui";
import { useFetchWrapper, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import CurationEntryEditor from "@components/features/curation/CurationEntryEditor";
import GenreRef from "@components/features/curation/GenreRef";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { PAIRED_LABEL_COLUMNS, curationColumnTitle, displayedCurationColumns } from "@lib/curationColumns";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import {
  BOOL_COLUMNS,
  ITEM_ID_COLUMNS,
  type CurationEntriesPage,
  type CurationEntry,
  type CurationList,
  type CurationOrdering,
} from "@schemas/api/curation";

type Props = {
  list: CurationList;
  entries: CurationEntriesPage;
  q: string;
  ordering: CurationOrdering;
  showQid: boolean;
};

function useUpdateQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (changes: Record<string, string | null>, navigate: "push" | "replace" = "replace") => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router[navigate](query ? `${pathname}?${query}` : pathname);
  };
}

function Cell({
  column,
  entry,
  labels,
  showQid,
}: {
  column: string;
  entry: CurationEntry;
  labels: Record<string, string>;
  showQid: boolean;
}) {
  const value = entry.row[column];
  if (BOOL_COLUMNS.has(column)) return value ? "Oui" : "Non";
  if (ITEM_ID_COLUMNS.has(column) && typeof value === "string" && value) {
    const paired = entry.row[PAIRED_LABEL_COLUMNS[column]];
    return <GenreRef id={value} label={labels[value] || (typeof paired === "string" ? paired : "")} showQid={showQid} />;
  }
  return value;
}

function entryName(list: CurationList, entry: CurationEntry, labels: Record<string, string>) {
  return list.keyColumns
    .map((column) => {
      const value = String(entry.row[column] ?? "");
      return labels[value] || value;
    })
    .join(" / ");
}

function EntryActions({
  list,
  entry,
  labels,
  onEdit,
}: {
  list: CurationList;
  entry: CurationEntry;
  labels: Record<string, string>;
  onEdit: () => void;
}) {
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const name = entryName(list, entry, labels);
  const remove = useValidatedMutation({
    inputSchema: z.null(),
    outputSchema: z.null(),
    mutationFn: () => fetch(`curation/${list.name}/entries/${entry.uuid}/`, true, false, { method: "DELETE" }),
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <Button onClick={onEdit} disabled={remove.isPending} aria-label={`Modifier ${name}`}>
          Modifier
        </Button>
        <Button
          variant="secondary"
          onClick={() => window.confirm(`Supprimer ${name} ?`) && remove.mutate(null)}
          disabled={remove.isPending}
          aria-label={`Supprimer ${name}`}
        >
          Supprimer
        </Button>
      </div>
      {remove.formErrors.map((error, index) => (
        <p key={index} role="alert" className="text-red-500">
          {error.message}
        </p>
      ))}
    </div>
  );
}

function Toolbar({ q, ordering, showQid, onAdd }: Omit<Props, "list" | "entries"> & { onAdd: () => void }) {
  const updateQuery = useUpdateQuery();
  const [text, setText] = useState(q);
  const search = useDebouncedValue(text.trim(), 300);

  useEffect(() => {
    if (search !== q) updateQuery({ q: search, page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a settled search should navigate, not a new router identity
  }, [search]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col flex-1 min-w-48 gap-1 text-sm font-medium text-gray-700">
        Rechercher
        <input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Genre, QID, raison…"
          className="w-full px-3 py-2 font-normal border rounded-md"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Trier par
        <select
          value={ordering}
          onChange={(event) => updateQuery({ ordering: event.target.value === "key" ? null : event.target.value, page: null })}
          className="px-3 py-2 font-normal border rounded-md"
        >
          <option value="key">Clé</option>
          <option value="-updated_on">Dernière modification</option>
        </select>
      </label>
      <label className="flex items-center gap-2 py-2 text-sm">
        <input
          type="checkbox"
          checked={showQid}
          onChange={(event) => updateQuery({ qid: event.target.checked ? "1" : null })}
        />
        Afficher les QID
      </label>
      <Button onClick={onAdd}>Ajouter</Button>
    </div>
  );
}

export default function CurationEntries({ list, entries, q, ordering, showQid }: Props) {
  const updateQuery = useUpdateQuery();
  const [editing, setEditing] = useState<CurationEntry | "new" | null>(null);
  const columns = displayedCurationColumns(list.columns);
  const { labels, results } = entries;

  return (
    <div className="flex flex-col gap-4">
      <Toolbar q={q} ordering={ordering} showQid={showQid} onAdd={() => setEditing("new")} />
      <p className="text-sm text-gray-600">
        {entries.overallTotal} entrée{entries.overallTotal > 1 ? "s" : ""}
        {q && ` pour « ${q} »`}
      </p>
      {results.length > 0 && (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="p-2 text-sm font-medium text-gray-600">
                      {curationColumnTitle(column)}
                    </th>
                  ))}
                  <th className="p-2">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((entry) => (
                  <tr key={entry.uuid} className="align-top border-t">
                    {columns.map((column) => (
                      <td key={column} className="p-2">
                        <Cell column={column} entry={entry} labels={labels} showQid={showQid} />
                      </td>
                    ))}
                    <td className="p-2">
                      <EntryActions list={list} entry={entry} labels={labels} onEdit={() => setEditing(entry)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-3 md:hidden">
            {results.map((entry) => (
              <li key={entry.uuid}>
                <article className="flex flex-col gap-3 p-3 border rounded-lg">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    {columns.map((column) => (
                      <div key={column} className="contents">
                        <dt className="text-sm text-gray-600">{curationColumnTitle(column)}</dt>
                        <dd className="break-words">
                          <Cell column={column} entry={entry} labels={labels} showQid={showQid} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <EntryActions list={list} entry={entry} labels={labels} onEdit={() => setEditing(entry)} />
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
      <Pagination
        currentPage={entries.page}
        totalPages={entries.totalPages}
        onPageChange={(page) => updateQuery({ page: page > 1 ? String(page) : null }, "push")}
      />
      {editing && (
        <CurationEntryEditor
          list={list}
          entry={editing === "new" ? undefined : editing}
          labels={labels}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
