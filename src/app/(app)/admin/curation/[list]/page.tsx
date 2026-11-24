import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { Page } from "@behindthemusictree/ui";
import CurationStatus from "@components/features/curation/CurationStatus";
import CurationEntries from "@components/features/curation/CurationEntries";
import { auth } from "@lib/auth";
import { fetchCurationEntries, fetchCurationEntry, fetchCurationLists, fetchCurationStatus } from "@lib/curation";
import { curationListTitle } from "@lib/curationGroups";
import { CURATION_ORDERINGS } from "@schemas/api/curation";

type SearchParams = { page?: string; q?: string; ordering?: string; qid?: string; edit?: string };
type Props = { params: Promise<{ list: string }>; searchParams: Promise<SearchParams> };

export default async function CurationListPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const { list: listName } = await params;
  const list = (await fetchCurationLists()).find((candidate) => candidate.name === listName);
  if (!list) notFound();

  const { page: pageParam, q: qParam, ordering: orderingParam, qid, edit } = await searchParams;
  const page = pageParam && /^[1-9]\d{0,5}$/.test(pageParam) ? Number(pageParam) : 1;
  const q = qParam?.trim() ?? "";
  const ordering = CURATION_ORDERINGS.find((candidate) => candidate === orderingParam) ?? "key";
  const showQid = qid === "1";

  const editId = z.string().uuid().safeParse(edit);
  const [entries, status, initialEntry] = await Promise.all([
    fetchCurationEntries(list.name, { page, q, ordering }),
    fetchCurationStatus(),
    editId.success ? fetchCurationEntry(list.name, editId.data) : null,
  ]);
  if (!entries) {
    const kept = new URLSearchParams();
    if (q) kept.set("q", q);
    if (ordering !== "key") kept.set("ordering", ordering);
    if (showQid) kept.set("qid", "1");
    if (editId.success) kept.set("edit", editId.data);
    const query = kept.toString();
    redirect(`/admin/curation/${list.name}${query ? `?${query}` : ""}`);
  }

  return (
    <Page title={curationListTitle(list.name)} data-page="admin-curation-list">
      <div className="flex flex-col gap-4 p-4">
        <CurationStatus status={status} />
        <p>{list.description}</p>
        <CurationEntries
          key={initialEntry?.uuid}
          list={list}
          initialEntry={initialEntry ?? undefined}
          entries={entries}
          q={q}
          ordering={ordering}
          showQid={showQid}
          appliedExportOn={status.appliedExportOn}
        />
      </div>
    </Page>
  );
}
