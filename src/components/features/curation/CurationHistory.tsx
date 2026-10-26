import Link from "next/link";
import GenreRef from "@components/features/curation/GenreRef";
import { curationColumnTitle } from "@lib/curationColumns";
import { curationListTitle } from "@lib/curationGroups";
import {
  CurationSnapshotSchema,
  curationColumnKind,
  type CurationHistoryItem,
  type CurationList,
} from "@schemas/api/curation";

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

type Context = { lists: CurationList[]; labels: Record<string, string> };

function Value({ column, snapshot, lists, labels }: Context & { column: string; snapshot: Snapshot }) {
  const value = snapshot[column];
  const list = lists.find((candidate) => candidate.name === snapshot.list_name);
  const kind = list ? curationColumnKind(list, column) : "text";
  if (kind === "bool") return value === true || value === "true" ? "Oui" : "Non";
  if (kind === "item_id" && typeof value === "string" && value) {
    return <GenreRef id={value} label={labels[value]} showQid />;
  }
  return value || "—";
}

function changedColumns(item: CurationHistoryItem, before: Snapshot, after: Snapshot) {
  const columns = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).filter(
    (column) => column !== "list_name",
  );
  if (item.action !== "updated") return columns;
  return columns.filter((column) => String(before[column] ?? "") !== String(after[column] ?? ""));
}

function HistoryItem({ item, lists, labels }: Context & { item: CurationHistoryItem }) {
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
                    <Value column={column} snapshot={before} lists={lists} labels={labels} />
                  </del>
                  <span aria-hidden>→</span>
                  <ins className="no-underline">
                    <Value column={column} snapshot={after} lists={lists} labels={labels} />
                  </ins>
                </>
              ) : (
                <Value column={column} snapshot={shown} lists={lists} labels={labels} />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export default function CurationHistory({ items, lists, labels }: Context & { items: CurationHistoryItem[] }) {
  if (items.length === 0) return <p className="text-gray-600">Aucune modification enregistrée.</p>;
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.uuid}>
          <HistoryItem item={item} lists={lists} labels={labels} />
        </li>
      ))}
    </ol>
  );
}
