import Link from "next/link";
import GenreRef from "@components/features/curation/GenreRef";
import { PAIRED_LABEL_COLUMNS, curationColumnTitle, displayedCurationColumns } from "@lib/curationColumns";
import { curationListTitle } from "@lib/curationGroups";
import { BOOL_COLUMNS, CurationSnapshotSchema, ITEM_ID_COLUMNS, type CurationHistoryItem } from "@schemas/api/curation";

type Snapshot = Record<string, string | boolean | null>;

const ACTION_LABELS = { created: "Ajout", updated: "Modification", deleted: "Suppression" } as const;

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

function parseSnapshot(value: string | null): Snapshot {
  return value === null ? {} : CurationSnapshotSchema.parse(JSON.parse(value));
}

function Value({ column, snapshot }: { column: string; snapshot: Snapshot }) {
  const value = snapshot[column];
  if (BOOL_COLUMNS.has(column)) return value === true || value === "true" ? "Oui" : "Non";
  if (ITEM_ID_COLUMNS.has(column) && typeof value === "string" && value) {
    const paired = snapshot[PAIRED_LABEL_COLUMNS[column]];
    return <GenreRef id={value} label={typeof paired === "string" ? paired : undefined} showQid />;
  }
  return value || "—";
}

function changedColumns(item: CurationHistoryItem, before: Snapshot, after: Snapshot) {
  const columns = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).filter(
    (column) => column !== "list_name",
  );
  if (item.action !== "updated") return displayedCurationColumns(columns);
  const changed = columns.filter((column) => String(before[column] ?? "") !== String(after[column] ?? ""));
  // A genre change carries its new name along; the name only gets a line of its own when it changed alone.
  return changed.filter(
    (column) => !Object.entries(PAIRED_LABEL_COLUMNS).some(([id, label]) => label === column && changed.includes(id)),
  );
}

function HistoryItem({ item }: { item: CurationHistoryItem }) {
  const before = parseSnapshot(item.oldValue);
  const after = parseSnapshot(item.newValue);
  const listName = after.list_name ?? before.list_name;
  const shown = item.action === "deleted" ? before : after;

  return (
    <article className="flex flex-col gap-2 p-3 border rounded-lg">
      <p className="flex flex-wrap gap-x-2 text-sm text-gray-600">
        <time dateTime={item.createdOn}>{DATE_FORMAT.format(new Date(item.createdOn))}</time>
        <span>· {item.actorPseudo ?? "pipeline"}</span>
        <span className="font-medium text-gray-900">· {ACTION_LABELS[item.action]}</span>
        <span>
          ·{" "}
          {typeof listName === "string" ? (
            <Link href={`/admin/curation/${listName}`} className="underline">
              {curationListTitle(listName)}
            </Link>
          ) : (
            "liste inconnue"
          )}
        </span>
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {changedColumns(item, before, after).map((column) => (
          <div key={column} className="contents">
            <dt className="text-sm text-gray-600">{curationColumnTitle(column)}</dt>
            <dd className="flex flex-wrap items-center gap-2 break-words">
              {item.action === "updated" ? (
                <>
                  <del className="text-gray-500">
                    <Value column={column} snapshot={before} />
                  </del>
                  <span aria-hidden>→</span>
                  <ins className="no-underline">
                    <Value column={column} snapshot={after} />
                  </ins>
                </>
              ) : (
                <Value column={column} snapshot={shown} />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export default function CurationHistory({ items }: { items: CurationHistoryItem[] }) {
  if (items.length === 0) return <p className="text-gray-600">Aucune modification enregistrée.</p>;
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.uuid}>
          <HistoryItem item={item} />
        </li>
      ))}
    </ol>
  );
}
