import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Page from "@components/ui/Page";
import CurationBanner from "@components/features/curation/CurationBanner";
import CurationTable from "@components/features/curation/CurationTable";
import { auth } from "@lib/auth";
import { fetchCurationEntries, fetchCurationLists } from "@lib/curation";

type Props = { params: Promise<{ list: string }>; searchParams: Promise<{ page?: string }> };

export default async function CurationListPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const { list: listName } = await params;
  const list = (await fetchCurationLists()).find((candidate) => candidate.name === listName);
  if (!list) notFound();

  const pageParam = (await searchParams).page;
  const page = pageParam && /^[1-9]\d{0,5}$/.test(pageParam) ? Number(pageParam) : 1;
  const entries = await fetchCurationEntries(list.name, page);
  if (!entries) redirect(`/admin/curation/${list.name}`);

  return (
    <Page title={list.name} dataPage="admin-curation-list">
      <div className="flex flex-col gap-4 p-4">
        <CurationBanner />
        <p>{list.description}</p>
        <CurationTable list={list} entries={entries.results} />
        {entries.totalPages > 1 && (
          <nav aria-label="Pagination" className="flex items-center gap-4">
            {page > 1 && (
              <Link href={`?page=${page - 1}`} className="underline">
                Previous
              </Link>
            )}
            <span>
              Page {page} of {entries.totalPages} ({entries.overallTotal} entries)
            </span>
            {page < entries.totalPages && (
              <Link href={`?page=${page + 1}`} className="underline">
                Next
              </Link>
            )}
          </nav>
        )}
      </div>
    </Page>
  );
}
