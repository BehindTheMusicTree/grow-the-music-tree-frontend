import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act, within } from "@testing-library/react";
import { PipelineRunsPageSchema, type ImportProgress, type PipelineRunLatest } from "@schemas/api/pipeline-runs";
import PipelineRunPanel from "./PipelineRunPanel";

const refreshMock = vi.fn();
const mutateMock = vi.fn();
let latest: PipelineRunLatest | null = null;

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshMock }) }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ setQueryData: vi.fn() }) }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useValidatedMutation: () => ({ mutate: mutateMock, formErrors: [], isPending: false }),
  useQueryWithParse: () => ({ data: latest, refetch: vi.fn() }),
}));

const request = (overrides: Partial<PipelineRunLatest>): PipelineRunLatest => ({
  uuid: "11111111-1111-4111-8111-111111111111",
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
  activeImport: null,
  typicalStageSeconds: null,
  ...overrides,
});

const curationButton = () => screen.getByRole("button", { name: "Appliquer la curation" });
const syncButton = () => screen.getByRole("button", { name: "Réimporter le dernier Gold" });
const fullButton = () => screen.getByRole("button", { name: "Lancer une ingestion complète" });

describe("PipelineRunPanel", () => {
  afterEach(() => {
    cleanup();
    latest = null;
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("launches every kind when no run is active", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<PipelineRunPanel pendingCount={2} initialRequest={null} />);

    fireEvent.click(curationButton());
    fireEvent.click(fullButton());
    fireEvent.click(syncButton());

    expect(mutateMock.mock.calls).toEqual([["curation"], ["full"], ["sync"]]);
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
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", String((8 + 1 / 4) / 14));
    expect(screen.getByText("Ingestion complète : Envoi des morceaux (1/4)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(mutateMock).toHaveBeenCalledWith(latest.uuid);
  });

  it("lists every stage of the run with its state", () => {
    latest = request({ kind: "sync", stage: "uploading_songs", stageCurrent: 1, stageTotal: 4 });
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    const items = within(screen.getByRole("list", { name: "Étapes du run" })).getAllByRole("listitem");

    expect(items.map((item) => item.textContent)).toEqual([
      "Import des arbres de genresterminée",
      "Import du graphe des genresterminée",
      "Envoi des morceaux(1/4)en cours",
      "Fusion des morceauxà venir",
      "Envoi des artistesà venir",
      "Fusion des artistesà venir",
      "Envoi de la carte des régionsà venir",
      "Fusion de la carte des régionsà venir",
    ]);
    expect(items[2]).toHaveAttribute("aria-current", "step");
  });

  it("marks the stage a failed run stopped at and hides the list once superseded", () => {
    latest = request({ status: "failed", stage: "building_genres", error: "boom" });
    const { rerender } = render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText("interrompue").parentElement).toHaveTextContent("Ingestion Wikidata et construction des genres");

    latest = request({ status: "superseded" });
    rerender(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.queryByRole("list", { name: "Étapes du run" })).not.toBeInTheDocument();
  });

  it("shows a requested cancellation and the merge note", () => {
    latest = request({ stage: "merging_songs", cancelRequested: true });
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByRole("button", { name: "Annulation demandée…" })).toBeDisabled();
    expect(screen.getByText(/fusion déjà commencée/)).toBeInTheDocument();
  });

  it.each([
    [{ status: "queued" as const }, "Curation : En file d'attente"],
    [{ stage: "importing_tree" as const }, "Curation : Import des arbres de genres"],
    [{ stage: "importing_graph" as const }, "Curation : Import du graphe des genres"],
    [{ kind: "full" as const, stage: "ingesting_wikidata" as const }, "Ingestion complète : Ingestion Wikidata"],
    [{ status: "succeeded" as const }, "Curation : Appliquée"],
    [{ kind: "full" as const, status: "succeeded" as const }, "Ingestion complète : Terminée"],
    [{ kind: "sync" as const, stage: "uploading_artists" as const }, "Réimport du dernier Gold : Envoi des artistes"],
    [{ kind: "sync" as const, stage: "merging_artists" as const }, "Réimport du dernier Gold : Fusion des artistes"],
    [{ kind: "sync" as const, status: "succeeded" as const }, "Réimport du dernier Gold : Réimportée"],
    [{ status: "failed" as const, error: "Bronze manquant" }, "Curation : Échec : Bronze manquant"],
    [{ status: "superseded" as const }, "Curation : Déjà appliquée par le run nightly"],
    [{ status: "cancelled" as const }, "Curation : Annulée"],
    [{ status: "expired" as const }, "Curation : Expirée (aucun signe de vie depuis 30 min)"],
  ])("labels %o", (overrides, label) => {
    latest = request(overrides);
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("shows a Geohistory failure from a parsed run history response", () => {
    const page = PipelineRunsPageSchema.parse({
      overallTotal: 1,
      page: 1,
      totalPages: 1,
      results: [request({
        kind: "full",
        status: "failed",
        stage: "ingesting_geohistory",
        error: "source=openstreetmap HTTP 403",
      })],
    });
    latest = { ...page.results[0], activeImport: null, typicalStageSeconds: null };
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText("Ingestion complète : Échec — Ingestion Geohistory : source=openstreetmap HTTP 403")).toBeInTheDocument();
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
    latest = request({ uuid: "22222222-2222-4222-8222-222222222222", status: "succeeded" });
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

    expect(screen.getByText("Manuel · démarré le 12/10 à 12:00 · durée totale : 2 h 05 min")).toBeInTheDocument();
  });

  it("shows only the start time of an expired run that never recorded an end", () => {
    latest = request({ status: "expired", startedOn: "2026-10-12T10:00:00Z" });
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText("Manuel · démarré le 12/10 à 12:00")).toBeInTheDocument();
  });

  it("keeps the legacy step list when a stopped run has no recorded timing for its stage", () => {
    latest = request({
      kind: "full",
      status: "failed",
      stage: "ingesting_discogs",
      error: "boom",
      stepTelemetry: { variant: "split_silver", foreground: [], wikidata: [], wikidataRetry: null },
    });
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    const steps = within(screen.getByRole("list", { name: "Étapes du run" }));
    expect(steps.getByText("interrompue")).toBeInTheDocument();
  });

  it("describes a WDQS retry without an HTTP status", () => {
    latest = request({
      kind: "full",
      stage: "building_songs",
      stepTelemetry: {
        variant: "split_silver",
        foreground: [],
        wikidata: [{ stage: "ingesting_wikidata", state: "running", startedAt: "2026-10-12T10:02:00+00:00", finishedAt: null }],
        wikidataRetry: { attempt: 1, reason: "http", httpStatus: null },
      },
    });
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText(/WDQS \(erreur HTTP\)/)).toBeInTheDocument();
  });

  it("shows recorded durations on both chains and clears a recovered WDQS retry", () => {
    vi.useFakeTimers({ now: Date.parse("2026-10-12T10:03:00Z") });
    const stepTelemetry: NonNullable<PipelineRunLatest["stepTelemetry"]> = {
      variant: "split_silver",
      foreground: [{
        stage: "ingesting_discogs",
        state: "succeeded",
        startedAt: "2026-10-12T10:00:00Z",
        finishedAt: "2026-10-12T10:00:45Z",
      }, {
        stage: "ingesting_musicbrainz",
        state: "running",
        startedAt: "2026-10-12T10:01:00Z",
        finishedAt: null,
      }],
      wikidata: [{
        stage: "ingesting_wikidata",
        state: "running",
        startedAt: "2026-10-12T10:02:00Z",
        finishedAt: null,
      }],
      wikidataRetry: { attempt: 2, reason: "http", httpStatus: 503 },
    };
    latest = request({ kind: "full", stage: "building_songs", stepTelemetry });
    const { rerender } = render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);
    const foreground = within(screen.getByRole("list", { name: "Étapes du run" }));
    const wikidata = within(screen.getByRole("list", { name: "Chaîne Wikidata et Geohistory" }));

    expect(foreground.getByText("(45 s)")).toBeInTheDocument();
    expect(foreground.getByText("(depuis 2 min)")).toBeInTheDocument();
    expect(foreground.getAllByText("en cours")).toHaveLength(1);
    expect(wikidata.getByText("(depuis 1 min)")).toBeInTheDocument();
    expect(screen.getByText(/WDQS \(HTTP 503\).*tentative 2/)).toHaveAttribute("role", "status");
    act(() => vi.advanceTimersByTime(60_000));
    expect(wikidata.getByText("(depuis 2 min)")).toBeInTheDocument();

    latest = request({ kind: "full", stage: "building_songs", stepTelemetry: { ...stepTelemetry, wikidataRetry: null } });
    rerender(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);
    expect(screen.queryByText(/WDQS \(HTTP 503\)/)).not.toBeInTheDocument();

    latest = request({
      kind: "full",
      status: "succeeded",
      stage: "ingesting_discogs",
      stepTelemetry: {
        ...stepTelemetry,
        variant: "bronze_only",
        foreground: stepTelemetry.foreground.slice(0, 1),
        wikidata: [],
        wikidataRetry: null,
      },
    });
    rerender(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);
    expect(foreground.getByText("(45 s)")).toBeInTheDocument();
    expect(foreground.queryByText("Construction du Gold")).not.toBeInTheDocument();
  });

  it("counts up while the run is going", () => {
    vi.useFakeTimers({ now: Date.parse("2026-10-12T10:03:00Z") });
    latest = request({ trigger: "scheduled", startedOn: "2026-10-12T10:00:00Z" });
    render(<PipelineRunPanel pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText("Nightly · démarré le 12/10 à 12:00 · durée écoulée : 3 min")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(60_000));

    expect(screen.getByText("Nightly · démarré le 12/10 à 12:00 · durée écoulée : 4 min")).toBeInTheDocument();
  });

  describe("import progress", () => {
    const NOW = "2026-11-25T10:00:00Z";
    const importProgress = (overrides: Partial<ImportProgress> = {}): ImportProgress => ({
      runId: 127,
      taskId: "import-run-127",
      kind: "genre_graph",
      mode: "full",
      attempt: 1,
      state: "running",
      startedAt: "2026-11-25T09:00:00Z",
      step: "write",
      stepStartedAt: "2026-11-25T09:31:00Z",
      heartbeatAt: "2026-11-25T09:59:42Z",
      sql: {},
      observabilityStale: false,
      bootstrap: false,
      ...overrides,
    });
    const renderImport = (activeImport: ImportProgress | null) => {
      vi.useFakeTimers({ now: Date.parse(NOW) });
      latest = request({ kind: "sync", stage: "merging_songs", activeImport });
      render(<PipelineRunPanel pendingCount={0} initialRequest={latest} />);
    };

    it("shows the running merge step, attempt and last sign of life", () => {
      renderImport(importProgress());

      expect(screen.getByText("Fusion : étape write depuis 29 min · tentative 1 · dernier signe de vie il y a 18 s")).toBeInTheDocument();
      expect(screen.queryByText(/attente SQL/)).not.toBeInTheDocument();
      expect(screen.queryByText(/bootstrap/)).not.toBeInTheDocument();
    });

    it("shows the SQL wait with its blockers", () => {
      renderImport(importProgress({ sql: { waitEventType: "Lock", blockerCount: 2 } }));

      expect(screen.getByText(/· attente SQL : Lock \(2 bloquants\)/)).toBeInTheDocument();
    });

    it("notes a bootstrap", () => {
      renderImport(importProgress({ bootstrap: true }));

      expect(screen.getByText(/· bootstrap \(premier import du graphe, peut durer plusieurs heures\)/)).toBeInTheDocument();
    });

    it("warns, as a status, when the observability is stale", () => {
      renderImport(importProgress({ observabilityStale: true }));

      expect(screen.getByRole("status")).toHaveTextContent("Aucun signe de vie récent de la fusion");
    });

    it.each(["succeeded", "failed", "interrupted"] as const)("hides a %s attempt", (state) => {
      renderImport(importProgress({ state }));

      expect(screen.queryByText(/Fusion : étape/)).not.toBeInTheDocument();
    });

    it("shows nothing without an import", () => {
      renderImport(null);

      expect(screen.queryByText(/Fusion : étape/)).not.toBeInTheDocument();
    });
  });

  describe("progress bar", () => {
    const progress = () => (screen.getByRole("progressbar") as HTMLProgressElement).value;

    it("weights each stage by its median, with the median of medians for a stage without one", () => {
      latest = request({
        kind: "sync",
        stage: "merging_songs",
        typicalStageSeconds: { foreground: { importing_tree: 100, importing_graph: 300, merging_songs: 600 }, wikidata: {} },
      });
      render(<PipelineRunPanel pendingCount={0} initialRequest={latest} />);

      // done: 100 + 300 + 300 (uploading_songs); total: 1000 + 5 × 300
      expect(progress()).toBeCloseTo(700 / 2500);
    });

    it("applies the upload sub-progress to the weight of the current stage", () => {
      latest = request({
        kind: "sync",
        stage: "uploading_songs",
        stageCurrent: 1,
        stageTotal: 2,
        typicalStageSeconds: { foreground: { importing_tree: 100, importing_graph: 300, uploading_songs: 400 }, wikidata: {} },
      });
      render(<PipelineRunPanel pendingCount={0} initialRequest={latest} />);

      // done: 100 + 300 + 400 / 2; total: 800 + 5 × 300
      expect(progress()).toBeCloseTo(600 / 2300);
    });

    it("falls back to the stage position when every median is zero", () => {
      latest = request({
        kind: "sync",
        stage: "merging_songs",
        typicalStageSeconds: { foreground: { importing_tree: 0 }, wikidata: {} },
      });
      render(<PipelineRunPanel pendingCount={0} initialRequest={latest} />);

      expect(progress()).toBeCloseTo(3 / 8);
    });

    it("falls back to equal weights without typical durations", () => {
      latest = request({ kind: "sync", stage: "merging_songs" });
      render(<PipelineRunPanel pendingCount={0} initialRequest={latest} />);

      expect(progress()).toBeCloseTo(3 / 8);
    });
  });
});
