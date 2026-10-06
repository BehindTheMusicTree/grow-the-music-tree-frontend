import { notFound, redirect } from "next/navigation";
import Page from "@components/ui/Page";
import ImportRunHistory from "@components/features/import-runs/ImportRunHistory";
import LatestImportRuns from "@components/features/import-runs/LatestImportRuns";
import { auth } from "@lib/auth";
import { fetchImportRuns, fetchLatestImportRuns } from "@lib/import-runs";
import { ImportKindSchema } from "@schemas/api/import-runs";

type Props = { searchParams: Promise<{ kind?: string; page?: string }> };

export default async function ImportsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const { kind: kindParam, page: pageParam } = await searchParams;
  const kind = kindParam === undefined ? undefined : ImportKindSchema.safeParse(kindParam).data;
  if (kindParam !== undefined && !kind) notFound();
  const page = pageParam && /^[1-9]\d{0,5}$/.test(pageParam) ? Number(pageParam) : 1;

  const [latest, history] = await Promise.all([fetchLatestImportRuns(), fetchImportRuns(page, kind)]);
  if (!history) redirect(kind ? `/admin/imports?kind=${kind}` : "/admin/imports");

  return (
    <Page title="Imports" dataPage="admin-imports">
      <div className="flex flex-col gap-6 p-4">
        <section aria-labelledby="latest-imports" className="flex flex-col gap-2">
          <h2 id="latest-imports" className="font-semibold">
            Latest imports
          </h2>
          {/* eslint-disable-next-line react-hooks/purity -- a dynamic server component renders once per request */}
          <LatestImportRuns runs={latest} now={Date.now()} />
        </section>
        <section aria-labelledby="import-history" className="flex flex-col gap-2">
          <h2 id="import-history" className="font-semibold">
            History
          </h2>
          <ImportRunHistory runs={history} kind={kind} />
        </section>
      </div>
    </Page>
  );
}
