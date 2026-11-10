"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Pagination } from "@behindthemusictree/ui";
import CurationEdgeEditor from "@components/features/curation/CurationEdgeEditor";
import CurationEdgeRows from "@components/features/curation/CurationEdgeRows";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { EDGE_RELATIONS, type CurationEdge, type CurationEdgesPage, type EdgeRelation } from "@schemas/api/curation";

type Props = {
  edges: CurationEdgesPage;
  q: string;
  relation: EdgeRelation | null;
  showQid: boolean;
  appliedExportOn: string | null;
};

export default function CurationEdges({ edges, q, relation, showQid, appliedExportOn }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState<CurationEdge | "new" | null>(null);
  const [text, setText] = useState(q);
  const search = useDebouncedValue(text.trim(), 300);

  const updateQuery = (changes: Record<string, string | null>, navigate: "push" | "replace" = "replace") => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router[navigate](query ? `${pathname}?${query}` : pathname);
  };

  useEffect(() => {
    if (search !== q) updateQuery({ q: search, page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a settled search should navigate, not a new router identity
  }, [search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col flex-1 min-w-48 gap-1 text-body font-medium text-gray-700">
          Rechercher
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Genre, QID, raison…"
            className="w-full px-3 py-2 font-normal border rounded-md"
          />
        </label>
        <label className="flex flex-col gap-1 text-body font-medium text-gray-700">
          Relation
          <select
            value={relation ?? ""}
            onChange={(event) => updateQuery({ relation: event.target.value || null, page: null })}
            className="px-3 py-2 font-normal border rounded-md"
          >
            <option value="">Toutes</option>
            {Object.entries(EDGE_RELATIONS).map(([value, title]) => (
              <option key={value} value={value}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 py-2 text-body">
          <input
            type="checkbox"
            checked={showQid}
            onChange={(event) => updateQuery({ qid: event.target.checked ? "1" : null })}
          />
          Afficher les QID
        </label>
        <Button onClick={() => setEditing("new")}>Ajouter</Button>
      </div>
      <p className="text-body text-gray-600">
        {edges.overallTotal} arête{edges.overallTotal > 1 ? "s" : ""}
        {q && ` pour « ${q} »`}
      </p>
      {edges.results.length > 0 && (
        <CurationEdgeRows
          edges={edges.results}
          labels={edges.labels}
          showQid={showQid}
          appliedExportOn={appliedExportOn}
          onEdit={setEditing}
        />
      )}
      <Pagination
        currentPage={edges.page}
        totalPages={edges.totalPages}
        onPageChange={(page) => updateQuery({ page: page > 1 ? String(page) : null }, "push")}
      />
      {editing && (
        <CurationEdgeEditor
          edge={editing === "new" ? undefined : editing}
          labels={edges.labels}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
