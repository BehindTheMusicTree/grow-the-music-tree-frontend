import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { PipelineRunRequest, PipelineRunsPage } from "@schemas/api/pipeline-runs";
import PipelineRunHistory from "./PipelineRunHistory";

const pushMock = vi.fn();
let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/admin/imports",
  useSearchParams: () => new URLSearchParams(search),
}));

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
    render(<PipelineRunHistory runs={RUNS} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows.map((row) => row.textContent)).toEqual([
      "12 Oct 2026, 04:00CurationManuel · admin@example.comEn cours—",
      "12 Oct 2026, 04:00Ingestion complèteNightlyRéussi3 h 12 min",
      "12 Oct 2026, 08:30CurationManuelEn file d'attente—",
    ]);
  });

  it("keeps the import history's params when paginating", () => {
    search = "kind=songs&page=2";
    render(<PipelineRunHistory runs={RUNS} />);

    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(pushMock).toHaveBeenCalledWith("/admin/imports?kind=songs&page=2&runsPage=2");
  });

  it("drops runsPage when going back to the first page", () => {
    search = "runsPage=2";
    render(<PipelineRunHistory runs={{ ...RUNS, page: 2 }} />);

    fireEvent.click(screen.getByRole("button", { name: "1" }));

    expect(pushMock).toHaveBeenCalledWith("/admin/imports");
  });

  it("says when there is no run yet", () => {
    render(<PipelineRunHistory runs={{ overallTotal: 0, page: 1, totalPages: 1, results: [] }} />);

    expect(screen.getByText("Aucun run pour l'instant")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
