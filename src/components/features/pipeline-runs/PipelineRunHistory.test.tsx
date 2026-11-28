import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PIPELINE_RUN_LATEST_QUERY_KEY, type PipelineRunLatest, type PipelineRunRequest, type PipelineRunsPage } from "@schemas/api/pipeline-runs";
import PipelineRunHistory from "./PipelineRunHistory";

const refresh = vi.fn();
const pushMock = vi.fn();
let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: pushMock }),
  usePathname: () => "/admin/imports",
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));

const source: PipelineRunRequest = {
  uuid: "11111111-1111-4111-8111-111111111111", kind: "full", trigger: "manual", requestedBy: null,
  status: "failed", stage: null, stageCurrent: null, stageTotal: null, error: null, cancelRequested: false,
  requestedOn: "2026-10-12T10:00:00Z", startedOn: null, heartbeatOn: null, finishedOn: null,
  artistsRecovery: { eligible: true, reason: null, songsApplied: true, artistsApplied: false, snapshotsFinalized: false },
};
const queued: PipelineRunRequest = { ...source, uuid: "22222222-2222-4222-8222-222222222222", kind: "sync_artists", status: "queued", sourceRunUuid: source.uuid };
const button = () => screen.getByRole("button", { name: "Importer les artistes de ce Gold" });
function setup(latest: PipelineRunLatest | null = null) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  client.setQueryData(PIPELINE_RUN_LATEST_QUERY_KEY, latest);
  render(<QueryClientProvider client={client}><PipelineRunHistory runs={{ overallTotal: 1, page: 1, totalPages: 1, results: [source] }} /></QueryClientProvider>);
  return client;
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); refresh.mockReset(); pushMock.mockClear(); search = ""; });

describe("PipelineRunHistory", () => {
  it.each([200, 201])("requests recovery and shares the queued run after HTTP %s", async (status) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(queued), { status }));
    vi.stubGlobal("fetch", fetchMock);
    const client = setup();
    fireEvent.click(button());
    await waitFor(() => expect(client.getQueryData<PipelineRunLatest>(PIPELINE_RUN_LATEST_QUERY_KEY)?.uuid).toBe(queued.uuid));
    expect(fetchMock).toHaveBeenCalledWith("/api/grow-proxy/pipeline/runs/", expect.objectContaining({
      method: "POST", body: JSON.stringify({ kind: "sync_artists", sourceRunUuid: source.uuid }),
    }));
    expect(button()).toBeDisabled();
  });
  it("does not let an older latest request overwrite the newly queued run", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(queued), { status: 201 })));
    const client = setup();
    let resolveLatest!: (value: PipelineRunLatest | null) => void;
    const pending = client.fetchQuery({
      queryKey: PIPELINE_RUN_LATEST_QUERY_KEY,
      queryFn: () => new Promise<PipelineRunLatest | null>((resolve) => { resolveLatest = resolve; }),
    }).catch(() => null);
    fireEvent.click(button());
    await waitFor(() => expect(client.getQueryData<PipelineRunLatest>(PIPELINE_RUN_LATEST_QUERY_KEY)?.uuid).toBe(queued.uuid));
    await act(async () => { resolveLatest(null); await pending; });
    expect(client.getQueryData<PipelineRunLatest>(PIPELINE_RUN_LATEST_QUERY_KEY)?.uuid).toBe(queued.uuid);
    expect(button()).toBeDisabled();
  });
  it.each(["queued", "running"] as const)("blocks recovery while a run is %s", (status) => {
    setup({ ...queued, status, activeImport: null, typicalStageSeconds: null });
    expect(button()).toBeDisabled();
  });
  it("shows the validated conflict reason and refreshes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ details: { message: "Gold modifié" } }), { status: 409 })));
    setup();
    fireEvent.click(button());
    expect(await screen.findByRole("alert")).toHaveTextContent("Gold modifié");
    expect(refresh).toHaveBeenCalledOnce();
  });
});

function renderHistory(runs: PipelineRunsPage) {
  const client = new QueryClient();
  render(<QueryClientProvider client={client}><PipelineRunHistory runs={runs} /></QueryClientProvider>);
}

const run = (overrides: Partial<PipelineRunRequest>): PipelineRunRequest => ({
  uuid: crypto.randomUUID(),
  kind: "full",
  trigger: "scheduled",
  requestedBy: null,
  status: "succeeded",
  stage: null,
  stageCurrent: null,
  stageTotal: null,
  error: null,
  cancelRequested: false,
  requestedOn: "2026-10-12T01:59:00Z",
  startedOn: "2026-10-12T02:00:00Z",
  heartbeatOn: null,
  finishedOn: "2026-10-12T05:12:00Z",
  ...overrides,
});

const RUNS: PipelineRunsPage = {
  overallTotal: 45,
  page: 1,
  totalPages: 3,
  results: [
    run({ kind: "curation", trigger: "manual", requestedBy: "admin@example.com", status: "running", finishedOn: null }),
    run({}),
    run({ kind: "sync", trigger: "manual" }),
    run({
      kind: "curation",
      trigger: "manual",
      status: "queued",
      requestedOn: "2026-10-12T06:30:00Z",
      startedOn: null,
      finishedOn: null,
    }),
  ],
};

describe("PipelineRunHistory", () => {
  afterEach(() => {
    cleanup();
    pushMock.mockClear();
    search = "";
  });

  it("lists runs with their origin and duration", () => {
    renderHistory(RUNS);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows.map((row) => row.textContent)).toEqual([
      "12 Oct 2026, 04:00CurationManuel · admin@example.comEn cours—",
      "12 Oct 2026, 04:00Ingestion complèteNightlyRéussi3 h 12 min",
      "12 Oct 2026, 04:00Réimport du dernier GoldManuelRéussi3 h 12 min",
      "12 Oct 2026, 08:30CurationManuelEn file d'attente—",
    ]);
  });

  it("keeps the import history's params when paginating", () => {
    search = "kind=songs&page=2";
    renderHistory(RUNS);

    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(pushMock).toHaveBeenCalledWith("/admin/imports?kind=songs&page=2&runsPage=2");
  });

  it("drops runsPage when going back to the first page", () => {
    search = "runsPage=2";
    renderHistory({ ...RUNS, page: 2 });

    fireEvent.click(screen.getByRole("button", { name: "1" }));

    expect(pushMock).toHaveBeenCalledWith("/admin/imports");
  });

  it("says when there is no run yet", () => {
    renderHistory({ overallTotal: 0, page: 1, totalPages: 1, results: [] });

    expect(screen.getByText("Aucun run pour l'instant")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
