import { notFound, redirect } from "next/navigation";
import Page from "@components/ui/Page";
import CurationBanner from "@components/features/curation/CurationBanner";
import CurationEntries from "@components/features/curation/CurationEntries";
import { auth } from "@lib/auth";
import { fetchCurationEntries, fetchCurationLists } from "@lib/curation";
import { curationListTitle } from "@lib/curationGroups";
import { CURATION_ORDERINGS } from "@schemas/api/curation";

type SearchParams = { page?: string; q?: string; ordering?: string; qid?: string };
type Props = { params: Promise<{ list: string }>; searchParams: Promise<SearchParams> };

export default async function CurationListPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const { list: listName } = await params;
  const list = (await fetchCurationLists()).find((candidate) => candidate.name === listName);
  if (!list) notFound();

  const { page: pageParam, q: qParam, ordering: orderingParam, qid } = await searchParams;
  const page = pageParam && /^[1-9]\d{0,5}$/.test(pageParam) ? Number(pageParam) : 1;
  const q = qParam?.trim() ?? "";
  const ordering = CURATION_ORDERINGS.find((candidate) => candidate === orderingParam) ?? "key";
  const showQid = qid === "1";

  const entries = await fetchCurationEntries(list.name, { page, q, ordering });
  if (!entries) {
    const kept = new URLSearchParams();
    if (q) kept.set("q", q);
    if (ordering !== "key") kept.set("ordering", ordering);
    if (showQid) kept.set("qid", "1");
    const query = kept.toString();
    redirect(`/admin/curation/${list.name}${query ? `?${query}` : ""}`);
  }

  return (
    <Page title={curationListTitle(list.name)} dataPage="admin-curation-list">
      <div className="flex flex-col gap-4 p-4">
        <CurationBanner />
        <p>{list.description}</p>
        <CurationEntries
          list={list}
          entries={entries}
          q={q}
          ordering={ordering}
          showQid={showQid}
        />
      </div>
    </Page>
  );
}
