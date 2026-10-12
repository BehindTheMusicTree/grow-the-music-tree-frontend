import Link from "next/link";
import { redirect } from "next/navigation";
import Page from "@components/ui/Page";
import CurationStatus from "@components/features/curation/CurationStatus";
import CurationApply from "@components/features/curation/CurationApply";
import CurationGenreSearch from "@components/features/curation/CurationGenreSearch";
import { auth } from "@lib/auth";
import { fetchCurationLists, fetchCurationStatus, fetchLatestCurationApply } from "@lib/curation";
import { curationListTitle, groupCurationLists } from "@lib/curationGroups";

export default async function CurationPage() {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const [lists, status, latestApply] = await Promise.all([
    fetchCurationLists(),
    fetchCurationStatus(),
    fetchLatestCurationApply(),
  ]);
  const groups = groupCurationLists(lists);

  return (
    <Page title="Curation" dataPage="admin-curation">
      <div className="flex flex-col gap-6 p-4">
        <CurationStatus status={status} />
        <CurationApply pendingCount={status.pendingCount} initialRequest={latestApply} />
        <CurationGenreSearch />
        {groups.map((group) => (
          <section key={group.title} aria-labelledby={`curation-group-${group.title}`}>
            <h2 id={`curation-group-${group.title}`} className="mb-2 text-lg font-semibold">
              {group.title}
            </h2>
            <ul className="flex flex-col divide-y divide-gray-200">
              {group.lists.map((list) => (
                <li key={list.name}>
                  <Link
                    href={`/admin/curation/${list.name}`}
                    title={list.description}
                    className="flex items-baseline justify-between gap-4 py-2 hover:bg-gray-50"
                  >
                    <span className="font-medium underline">{curationListTitle(list.name)}</span>
                    <span className="tabular-nums text-gray-600">{list.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Page>
  );
}
