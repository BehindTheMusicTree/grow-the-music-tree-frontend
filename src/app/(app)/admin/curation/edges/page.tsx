import { redirect } from "next/navigation";
import { Page } from "@behindthemusictree/ui";
import CurationEdges from "@components/features/curation/CurationEdges";
import CurationStatus from "@components/features/curation/CurationStatus";
import { auth } from "@lib/auth";
import { fetchCurationEdges, fetchCurationStatus } from "@lib/curation";
import { EDGE_RELATIONS, type EdgeRelation } from "@schemas/api/curation";

type SearchParams = { page?: string; q?: string; relation?: string; qid?: string };
type Props = { searchParams: Promise<SearchParams> };

export default async function CurationEdgesPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const { page: pageParam, q: qParam, relation: relationParam, qid } = await searchParams;
  const page = pageParam && /^[1-9]\d{0,5}$/.test(pageParam) ? Number(pageParam) : 1;
  const q = qParam?.trim() ?? "";
  const relation = relationParam && relationParam in EDGE_RELATIONS ? (relationParam as EdgeRelation) : null;
  const showQid = qid === "1";

  const [edges, status] = await Promise.all([
    fetchCurationEdges({ page, q, relation: relation ?? undefined }),
    fetchCurationStatus(),
  ]);
  if (!edges) {
    const kept = new URLSearchParams();
    if (q) kept.set("q", q);
    if (relation) kept.set("relation", relation);
    if (showQid) kept.set("qid", "1");
    const query = kept.toString();
    redirect(`/admin/curation/edges${query ? `?${query}` : ""}`);
  }

  return (
    <Page title="Arêtes de genres" data-page="admin-curation-edges">
      <div className="flex flex-col gap-4 p-4">
        <CurationStatus status={status} />
        <p>Parents canoniques et régionaux, racines acceptées, vues régionales et parents secondaires.</p>
        <CurationEdges
          edges={edges}
          q={q}
          relation={relation}
          showQid={showQid}
          appliedExportOn={status.appliedExportOn}
        />
      </div>
    </Page>
  );
}
