"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@behindthemusictree/ui";
import { CurationEntryRows } from "@components/features/curation/CurationEntries";
import CurationEntryEditor from "@components/features/curation/CurationEntryEditor";
import { PAIRED_LABEL_COLUMNS } from "@lib/curationColumns";
import { curationListTitle } from "@lib/curationGroups";
import {
  ITEM_ID_COLUMNS,
  type CurationEntry,
  type CurationList,
  type CurationRow,
  type CurationRules,
} from "@schemas/api/curation";

type Props = { itemId: string; lists: CurationList[]; rules: CurationRules };

type Editing = { list: CurationList; entry?: CurationEntry; initialRow?: CurationRow };

/** The id column a new entry of `list` keys its genre by, if the list is keyed by a genre at all. */
function genreKeyColumn(list: CurationList) {
  return list.keyColumns.find((column) => ITEM_ID_COLUMNS.has(column));
}

export default function CurationGenreRules({ itemId, lists, rules }: Props) {
  const { results, labels } = rules;
  const [editing, setEditing] = useState<Editing | null>(null);
  const addable = lists.filter(genreKeyColumn);
  const [addTo, setAddTo] = useState(addable[0]?.name ?? "");
  const sections = lists
    .map((list) => ({ list, entries: results.filter((entry) => entry.listName === list.name) }))
    .filter(({ entries }) => entries.length > 0);

  const add = () => {
    const list = addable.find((candidate) => candidate.name === addTo);
    if (!list) return;
    const column = genreKeyColumn(list)!;
    const paired = PAIRED_LABEL_COLUMNS[column];
    const initialRow: CurationRow = { [column]: itemId };
    if (paired && labels[itemId]) initialRow[paired] = labels[itemId];
    setEditing({ list, initialRow });
  };

  return (
    <div className="flex flex-col gap-6">
      {sections.length === 0 && <p className="text-gray-600">Aucune règle de curation ne concerne ce genre.</p>}
      {sections.map(({ list, entries }) => (
        <section key={list.name} aria-labelledby={`rules-${list.name}`} className="flex flex-col gap-2">
          <h2 id={`rules-${list.name}`} className="text-lg font-semibold">
            <Link href={`/admin/curation/${list.name}`} className="underline">
              {curationListTitle(list.name)}
            </Link>
          </h2>
          <CurationEntryRows
            list={list}
            results={entries}
            labels={labels}
            showQid={false}
            onEdit={(entry) => setEditing({ list, entry })}
          />
        </section>
      ))}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Ajouter une règle pour ce genre
          <select
            value={addTo}
            onChange={(event) => setAddTo(event.target.value)}
            className="px-3 py-2 font-normal border rounded-md"
          >
            {addable.map((list) => (
              <option key={list.name} value={list.name}>
                {curationListTitle(list.name)}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={add}>Ajouter</Button>
      </div>
      {editing && (
        <CurationEntryEditor
          list={editing.list}
          entry={editing.entry}
          initialRow={editing.initialRow}
          labels={labels}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
