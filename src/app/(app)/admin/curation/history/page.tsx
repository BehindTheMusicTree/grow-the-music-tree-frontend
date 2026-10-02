import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import Page from "@components/ui/Page";
import CurationBanner from "@components/features/curation/CurationBanner";
import CurationHistory from "@components/features/curation/CurationHistory";
import GenreRef from "@components/features/curation/GenreRef";
import { auth } from "@lib/auth";
import { fetchCurationHistory, fetchCurationLists, type CurationHistoryFilter } from "@lib/curation";
import { curationListTitle } from "@lib/curationGroups";
import { ITEM_ID_PATTERN } from "@schemas/api/curation";

const PAGE_SIZE = 50;

type SearchParams = { list?: string; entry?: string; item_id?: string; page?: string };
type Props = { searchParams: Promise<SearchParams> };

function historyHref({ list, entry, itemId }: CurationHistoryFilter, page = 1) {
  const query = new URLSearchParams();
  if (list) query.set("list", list);
  if (entry) query.set("entry", entry);
  if (itemId) query.set("item_id", itemId);
  if (page > 1) query.set("page", String(page));
  const search = query.toString();
  return `/admin/curation/history${search ? `?${search}` : ""}`;
}

export default async function CurationHistoryPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const { list, entry, item_id: itemId, page: pageParam } = await searchParams;
  if (list && !(await fetchCurationLists()).some((candidate) => candidate.name === list)) notFound();
  if (entry && !z.string().uuid().safeParse(entry).success) notFound();
  if (itemId && !ITEM_ID_PATTERN.test(itemId)) notFound();
  const filter = { list, entry, itemId };
  const page = pageParam && /^[1-9]\d{0,5}$/.test(pageParam) ? Number(pageParam) : 1;

  const history = await fetchCurationHistory(filter, { page, pageSize: PAGE_SIZE });
  if (!history) redirect(historyHref(filter));

  return (
    <Page title="Historique de curation" dataPage="admin-curation-history">
      <div className="flex flex-col gap-4 p-4">
        <CurationBanner />
        {(list || entry || itemId) && (
          <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            Filtré sur
            {list && <span className="font-medium text-gray-900">{curationListTitle(list)}</span>}
            {entry && <span>une entrée</span>}
            {itemId && <GenreRef id={itemId} showQid />}
            <Link href={historyHref({})} className="underline">
              Tout l&apos;historique
            </Link>
          </p>
        )}
        <p className="text-sm text-gray-600">
          {history.overallTotal} modification{history.overallTotal > 1 ? "s" : ""}
        </p>
        <CurationHistory items={history.results} />
        {history.totalPages > 1 && (
          <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
            {history.page > 1 && (
              <Link href={historyHref(filter, history.page - 1)} className="underline">
                Précédent
              </Link>
            )}
            <span className="text-sm text-gray-600">
              Page {history.page} / {history.totalPages}
            </span>
            {history.page < history.totalPages && (
              <Link href={historyHref(filter, history.page + 1)} className="underline">
                Suivant
              </Link>
            )}
          </nav>
        )}
      </div>
    </Page>
  );
}
