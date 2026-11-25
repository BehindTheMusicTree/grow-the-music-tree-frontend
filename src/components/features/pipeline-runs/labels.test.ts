import { describe, it, expect } from "vitest";
import { foregroundStepDetails, stepsOf } from "./labels";
import type { ImportProgress, PipelineRunLatest, PipelineRunStage } from "@schemas/api/pipeline-runs";

const base = { kind: "sync" as const, status: "running" as const, stage: null, stageCurrent: null, stageTotal: null };
const statuses = (steps: ReturnType<typeof stepsOf>) => steps?.map((step) => step.status);

describe("stepsOf", () => {
  it("lists every stage of the kind", () => {
    expect(stepsOf({ ...base, kind: "full", status: "queued" })).toHaveLength(14);
    expect(stepsOf({ ...base, kind: "curation", status: "queued" })).toHaveLength(12);
    expect(stepsOf({ ...base, status: "queued" })).toHaveLength(8);
  });

  it("is all pending when queued or when a running run has no stage yet", () => {
    expect(statuses(stepsOf({ ...base, status: "queued" }))).toEqual(Array(8).fill("pending"));
    expect(statuses(stepsOf(base))).toEqual(Array(8).fill("pending"));
  });

  it("is all done once succeeded", () => {
    expect(statuses(stepsOf({ ...base, status: "succeeded" }))).toEqual(Array(8).fill("done"));
  });

  it("ticks stages before the current one and shows the upload count", () => {
    const steps = stepsOf({ ...base, stage: "uploading_songs", stageCurrent: 2, stageTotal: 5 });

    expect(statuses(steps)).toEqual(["done", "done", "current", ...Array(5).fill("pending")]);
    expect(steps?.[2].detail).toBe("2/5");
  });

  it("gives no detail to a non-upload stage", () => {
    expect(stepsOf({ ...base, stage: "merging_songs", stageCurrent: 1, stageTotal: 2 })?.[3].detail).toBeUndefined();
  });

  it.each(["failed", "cancelled", "expired"] as const)("marks the stopping stage of a %s run", (status) => {
    expect(statuses(stepsOf({ ...base, status, stage: "merging_songs" }))).toEqual([
      "done",
      "done",
      "done",
      "failed",
      ...Array(4).fill("pending"),
    ]);
  });

  it("shows the region map upload count", () => {
    const steps = stepsOf({ ...base, stage: "uploading_region_map", stageCurrent: 3, stageTotal: 7 });

    expect(steps?.[6]).toMatchObject({ status: "current", detail: "3/7" });
  });

  it("puts a stage the kind doesn't list on the nearest earlier step", () => {
    const steps = stepsOf({ ...base, kind: "full", stage: "ingesting_wikidata" });

    expect(steps?.[2]).toMatchObject({ key: "ingesting_musicbrainz", status: "current" });
  });

  it("has no list when superseded", () => {
    expect(stepsOf({ ...base, status: "superseded" })).toBeNull();
  });

  it("places the graph import right after the tree import", () => {
    expect(stepsOf({ ...base, stage: "importing_graph" })?.map((step) => [step.key, step.status])).toEqual([
      ["importing_tree", "done"],
      ["importing_graph", "current"],
      ...["uploading_songs", "merging_songs", "uploading_artists", "merging_artists", "uploading_region_map", "merging_region_map"].map(
        (key) => [key, "pending"],
      ),
    ]);
  });
});

describe("foregroundStepDetails", () => {
  const timing = (stage: PipelineRunStage, state: "succeeded" | "running", startedAt = "2026-11-24T02:00:00Z") => ({
    stage,
    state,
    startedAt,
    finishedAt: state === "succeeded" ? "2026-11-24T02:10:00Z" : null,
  });
  const request = (
    foreground: ReturnType<typeof timing>[],
    stage: PipelineRunLatest["stage"],
    overrides: Partial<PipelineRunLatest> = {},
  ): PipelineRunLatest => ({
    uuid: "11111111-1111-4111-8111-111111111111",
    kind: "full",
    trigger: "manual",
    requestedBy: null,
    status: "running",
    stage,
    stageCurrent: null,
    stageTotal: null,
    stepTelemetry: { variant: "split_silver", foreground, wikidata: [], wikidataRetry: null },
    error: null,
    cancelRequested: false,
    requestedOn: "2026-11-24T02:00:00Z",
    startedOn: "2026-11-24T02:00:00Z",
    heartbeatOn: null,
    finishedOn: null,
    activeImport: null,
    typicalStageSeconds: null,
    ...overrides,
  });
  const keys = (run: PipelineRunLatest) => foregroundStepDetails(stepsOf(run) ?? [], run, null).map((step) => step.key);

  it("hides a step with no timing that sits before the last recorded one", () => {
    const run = request([timing("building_songs", "succeeded"), timing("building_gold", "running")], "building_gold");

    expect(keys(run)).not.toContain("building_genres");
    expect(keys(run)).toContain("building_gold");
  });

  it("keeps a step with no timing that comes after the last recorded one", () => {
    const run = request([timing("building_songs", "running")], "building_songs");

    expect(keys(run)).toContain("building_genres");
  });

  describe("typical durations", () => {
    const startedAt = "2026-11-24T05:00:00Z";
    const typical = { foreground: { importing_graph: 600 }, wikidata: {} };
    const detailAt = (minutes: number, overrides: Partial<PipelineRunLatest> = {}) => {
      const run = request([timing("importing_graph", "running", startedAt)], "importing_graph", {
        typicalStageSeconds: typical,
        ...overrides,
      });
      const now = Date.parse(startedAt) + minutes * 60_000;
      return foregroundStepDetails(stepsOf(run) ?? [], run, now).find((step) => step.key === "importing_graph")?.detail;
    };

    it("shows the usual duration next to the elapsed time", () => {
      expect(detailAt(15)).toBe("depuis 15 min · habituellement ~10 min");
    });

    it("flags a stage past max(2 × median, median + 600 s)", () => {
      expect(detailAt(20)).toBe("depuis 20 min · habituellement ~10 min");
      expect(detailAt(21)).toBe("depuis 21 min · habituellement ~10 min · plus long que d'habitude");
    });

    it("uses the 600 s margin when it beats twice a short median", () => {
      const detail = detailAt(12, { typicalStageSeconds: { foreground: { importing_graph: 60 }, wikidata: {} } });

      expect(detail).toBe("depuis 12 min · habituellement ~1 min · plus long que d'habitude");
      expect(detailAt(11, { typicalStageSeconds: { foreground: { importing_graph: 60 }, wikidata: {} } })).toBe(
        "depuis 11 min · habituellement ~1 min",
      );
    });

    it("shows no usual duration without a median for the stage", () => {
      expect(detailAt(15, { typicalStageSeconds: null })).toBe("depuis 15 min");
    });

    it("shows neither the usual duration nor the alert during a graph bootstrap", () => {
      const activeImport = { bootstrap: true } as ImportProgress;

      expect(detailAt(120, { activeImport })).toBe("depuis 2 h 00 min");
    });
  });
});
