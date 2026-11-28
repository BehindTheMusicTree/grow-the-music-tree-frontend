import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PIPELINE_RUN_LATEST_QUERY_KEY, type PipelineRunLatest, type PipelineRunRequest } from "@schemas/api/pipeline-runs";
import PipelineRunHistory from "./PipelineRunHistory";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
  usePathname: () => "/admin",
  useSearchParams: () => new URLSearchParams(),
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
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); refresh.mockReset(); });

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
