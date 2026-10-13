import { notFound, redirect } from "next/navigation";
import Page from "@components/ui/Page";
import ImportRunHistory from "@components/features/import-runs/ImportRunHistory";
import LatestImportRuns from "@components/features/import-runs/LatestImportRuns";
import PipelineRunHistory from "@components/features/pipeline-runs/PipelineRunHistory";
import PipelineRunPanel from "@components/features/pipeline-runs/PipelineRunPanel";
import { auth } from "@lib/auth";
import { fetchCurationStatus } from "@lib/curation";
import { fetchImportRuns, fetchLatestImportRuns } from "@lib/import-runs";
import { fetchLatestPipelineRun, fetchPipelineRuns } from "@lib/pipeline-runs";
import { ImportKindSchema } from "@schemas/api/import-runs";

type Props = { searchParams: Promise<{ kind?: string; page?: string; runsPage?: string }> };

const parsePage = (param: string | undefined) => (param && /^[1-9]\d{0,5}$/.test(param) ? Number(param) : 1);

export default async function ImportsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.error) redirect("/admin");

  const { kind: kindParam, page: pageParam, runsPage: runsPageParam } = await searchParams;
  const kind = kindParam === undefined ? undefined : ImportKindSchema.safeParse(kindParam).data;
  if (kindParam !== undefined && !kind) notFound();
  const page = parsePage(pageParam);
  const runsPage = parsePage(runsPageParam);

  const [latest, history, curationStatus, latestRun, runs] = await Promise.all([
    fetchLatestImportRuns(),
    fetchImportRuns(page, kind),
    fetchCurationStatus(),
    fetchLatestPipelineRun(),
    fetchPipelineRuns(runsPage),
  ]);
  if (!history) redirect(kind ? `/admin/imports?kind=${kind}` : "/admin/imports");
  if (!runs) {
    const query = new URLSearchParams();
    if (kind) query.set("kind", kind);
    if (page > 1) query.set("page", String(page));
    redirect(`/admin/imports${query.size ? `?${query}` : ""}`);
  }

  return (
    <Page title="Imports" dataPage="admin-imports">
      <div className="flex flex-col gap-6 p-4">
        <PipelineRunPanel pendingCount={curationStatus.pendingCount} initialRequest={latestRun} />
        <section aria-labelledby="pipeline-run-history" className="flex flex-col gap-2">
          <h2 id="pipeline-run-history" className="font-semibold">
            Historique des runs
          </h2>
          <PipelineRunHistory runs={runs} />
        </section>
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
