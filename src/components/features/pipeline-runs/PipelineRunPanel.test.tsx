import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import type { PipelineRunRequest } from "@schemas/api/pipeline-runs";
import PipelineRunPanel from "./PipelineRunPanel";

const refreshMock = vi.fn();
const mutateMock = vi.fn();
let latest: PipelineRunRequest | null = null;

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshMock }) }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ setQueryData: vi.fn() }) }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useValidatedMutation: () => ({ mutate: mutateMock, formErrors: [], isPending: false }),
  useQueryWithParse: () => ({ data: latest, refetch: vi.fn() }),
}));

const request = (overrides: Partial<PipelineRunRequest>): PipelineRunRequest => ({
  uuid: "11111111-1111-1111-1111-111111111111",
  kind: "curation",
  trigger: "manual",
  requestedBy: null,
  status: "running",
  stage: null,
  stageCurrent: null,
  stageTotal: null,
  error: null,
  cancelRequested: false,
  requestedOn: "2026-10-12T10:00:00Z",
  startedOn: null,
  heartbeatOn: null,
  finishedOn: null,
  ...overrides,
});

const curationButton = () => screen.getByRole("button", { name: "Appliquer la curation" });
const fullButton = () => screen.getByRole("button", { name: "Lancer une ingestion complète" });

describe("PipelineRunPanel", () => {
  afterEach(() => {
    cleanup();
    latest = null;
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("launches either kind when no run is active", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<PipelineRunPanel pendingCount={2} initialRequest={null} />);

    fireEvent.click(curationButton());
    fireEvent.click(fullButton());

    expect(mutateMock.mock.calls).toEqual([["curation"], ["full"]]);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Annuler" })).not.toBeInTheDocument();
  });

  it("does not launch a full ingestion when the confirmation is declined", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<PipelineRunPanel pendingCount={2} initialRequest={null} />);

    fireEvent.click(fullButton());

    expect(window.confirm).toHaveBeenCalledWith("Lancer une ingestion complète ? Le run dure plusieurs heures.");
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("disables only the curation when nothing is pending", () => {
    render(<PipelineRunPanel pendingCount={0} initialRequest={null} />);

    expect(curationButton()).toBeDisabled();
    expect(fullButton()).toBeEnabled();
  });

  it("shows the full ingestion's upload sub-progress and cancels it", () => {
    latest = request({ kind: "full", stage: "uploading_songs", stageCurrent: 1, stageTotal: 4 });
    render(<PipelineRunPanel pendingCount={2} initialRequest={latest} />);

    expect(curationButton()).toBeDisabled();
    expect(fullButton()).toBeDisabled();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", String((7 + 1 / 4) / 9));
    expect(screen.getByText("Ingestion complète : Envoi des morceaux (1/4)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(mutateMock).toHaveBeenCalledWith(latest.uuid);
  });

  it("shows a requested cancellation and the merge note", () => {
    latest = request({ stage: "merging_songs", cancelRequested: true });
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByRole("button", { name: "Annulation demandée…" })).toBeDisabled();
    expect(screen.getByText(/fusion déjà commencée/)).toBeInTheDocument();
  });

  it.each([
    [{ status: "queued" as const }, "Curation : En file d'attente"],
    [{ stage: "importing_tree" as const }, "Curation : Import de l'arbre"],
    [{ kind: "full" as const, stage: "ingesting_wikidata" as const }, "Ingestion complète : Ingestion Wikidata"],
    [{ status: "succeeded" as const }, "Curation : Appliquée"],
    [{ kind: "full" as const, status: "succeeded" as const }, "Ingestion complète : Terminée"],
    [{ status: "failed" as const, error: "Bronze manquant" }, "Curation : Échec : Bronze manquant"],
    [{ status: "superseded" as const }, "Curation : Déjà appliquée par le run nightly"],
    [{ status: "cancelled" as const }, "Curation : Annulée"],
    [{ status: "expired" as const }, "Curation : Expirée (aucun signe de vie depuis 30 min)"],
  ])("labels %o", (overrides, label) => {
    latest = request(overrides);
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("refreshes the page once the run finishes", () => {
    latest = request({ stage: "merging_songs" });
    const { rerender } = render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);
    expect(refreshMock).not.toHaveBeenCalled();

    latest = request({ status: "cancelled" });
    rerender(<PipelineRunPanel pendingCount={1} initialRequest={null} />);

    expect(refreshMock).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Annuler" })).not.toBeInTheDocument();
  });

  it("refreshes the page when a run is launched and when it starts, not on first render or re-polls", () => {
    latest = request({ uuid: "22222222-2222-2222-2222-222222222222", status: "succeeded" });
    const { rerender } = render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);
    expect(refreshMock).not.toHaveBeenCalled();

    latest = request({ status: "queued" });
    rerender(<PipelineRunPanel pendingCount={1} initialRequest={null} />);
    expect(refreshMock).toHaveBeenCalledOnce();

    latest = request({ status: "running", stage: "fetching_rules" });
    rerender(<PipelineRunPanel pendingCount={1} initialRequest={null} />);
    expect(refreshMock).toHaveBeenCalledTimes(2);

    latest = request({ status: "running", stage: "importing_tree" });
    rerender(<PipelineRunPanel pendingCount={1} initialRequest={null} />);
    expect(refreshMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    [{ trigger: "scheduled" as const }, "Nightly"],
    [{ requestedBy: "admin@example.com" }, "Manuel · admin@example.com"],
    [{}, "Manuel"],
  ])("shows the origin %o", (overrides, origin) => {
    latest = request(overrides);
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText(origin)).toBeInTheDocument();
  });

  it("shows no duration while queued", () => {
    latest = request({ status: "queued" });
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText("Manuel")).toBeInTheDocument();
  });

  it("shows how long a finished run took", () => {
    latest = request({
      status: "succeeded",
      startedOn: "2026-10-12T10:00:00Z",
      finishedOn: "2026-10-12T12:05:00Z",
    });
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText("Manuel · en 2 h 05 min")).toBeInTheDocument();
  });

  it("counts up while the run is going", () => {
    vi.useFakeTimers({ now: Date.parse("2026-10-12T10:03:00Z") });
    latest = request({ trigger: "scheduled", startedOn: "2026-10-12T10:00:00Z" });
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText("Nightly · depuis 3 min")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(60_000));

    expect(screen.getByText("Nightly · depuis 4 min")).toBeInTheDocument();
  });
});
