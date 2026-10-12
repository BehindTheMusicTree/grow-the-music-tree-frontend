import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { CurationApplyRequest } from "@schemas/api/curation";
import CurationApply from "./CurationApply";

const refreshMock = vi.fn();
const mutateMock = vi.fn();
let latest: CurationApplyRequest | null = null;

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshMock }) }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useValidatedMutation: () => ({ mutate: mutateMock, formErrors: [], isPending: false }),
  useQueryWithParse: () => ({ data: latest, refetch: vi.fn() }),
}));

const request = (overrides: Partial<CurationApplyRequest>): CurationApplyRequest => ({
  uuid: "11111111-1111-1111-1111-111111111111",
  status: "running",
  stage: null,
  stageCurrent: null,
  stageTotal: null,
  error: null,
  requestedOn: "2026-10-12T10:00:00Z",
  startedOn: null,
  finishedOn: null,
  ...overrides,
});

const button = () => screen.getByRole("button", { name: "Appliquer la curation" });

describe("CurationApply", () => {
  afterEach(() => {
    cleanup();
    latest = null;
    vi.clearAllMocks();
  });

  it("launches a run when edits are pending and none is active", () => {
    render(<CurationApply pendingCount={2} initialRequest={null} />);

    fireEvent.click(button());

    expect(mutateMock).toHaveBeenCalled();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("is disabled when nothing is pending", () => {
    render(<CurationApply pendingCount={0} initialRequest={null} />);

    expect(button()).toBeDisabled();
  });

  it("shows the upload sub-progress and is disabled while running", () => {
    latest = request({ stage: "uploading_songs", stageCurrent: 1, stageTotal: 4 });
    render(<CurationApply pendingCount={2} initialRequest={latest} />);

    expect(button()).toBeDisabled();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", String((4 + 1 / 4) / 6));
    expect(screen.getByText("Envoi des morceaux (1/4)")).toBeInTheDocument();
  });

  it.each([
    [{ status: "queued" as const }, "En file d'attente"],
    [{ stage: "importing_tree" as const }, "Import de l'arbre"],
    [{ status: "succeeded" as const }, "Appliquée"],
    [{ status: "failed" as const, error: "Bronze manquant" }, "Échec : Bronze manquant"],
    [{ status: "superseded" as const }, "Déjà appliquée par le run nightly"],
  ])("labels %o", (overrides, label) => {
    latest = request(overrides);
    render(<CurationApply pendingCount={1} initialRequest={latest} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("refreshes the page once the run finishes", () => {
    latest = request({ stage: "merging_songs" });
    const { rerender } = render(<CurationApply pendingCount={1} initialRequest={latest} />);
    expect(refreshMock).not.toHaveBeenCalled();

    latest = request({ status: "succeeded" });
    rerender(<CurationApply pendingCount={1} initialRequest={null} />);

    expect(refreshMock).toHaveBeenCalledOnce();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "1");
  });
});
