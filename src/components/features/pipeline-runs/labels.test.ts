import { describe, it, expect } from "vitest";
import { stepsOf } from "./labels";

const base = { kind: "sync" as const, status: "running" as const, stage: null, stageCurrent: null, stageTotal: null };
const statuses = (steps: ReturnType<typeof stepsOf>) => steps?.map((step) => step.status);

describe("stepsOf", () => {
  it("lists every stage of the kind", () => {
    expect(stepsOf({ ...base, kind: "full", status: "queued" })).toHaveLength(11);
    expect(stepsOf({ ...base, kind: "curation", status: "queued" })).toHaveLength(8);
    expect(stepsOf({ ...base, status: "queued" })).toHaveLength(5);
  });

  it("is all pending when queued or when a running run has no stage yet", () => {
    expect(statuses(stepsOf({ ...base, status: "queued" }))).toEqual(Array(5).fill("pending"));
    expect(statuses(stepsOf(base))).toEqual(Array(5).fill("pending"));
  });

  it("is all done once succeeded", () => {
    expect(statuses(stepsOf({ ...base, status: "succeeded" }))).toEqual(Array(5).fill("done"));
  });

  it("ticks stages before the current one and shows the upload count", () => {
    const steps = stepsOf({ ...base, stage: "uploading_songs", stageCurrent: 2, stageTotal: 5 });

    expect(statuses(steps)).toEqual(["done", "current", "pending", "pending", "pending"]);
    expect(steps?.[1].detail).toBe("2/5");
  });

  it("gives no detail to a non-upload stage", () => {
    expect(stepsOf({ ...base, stage: "merging_songs", stageCurrent: 1, stageTotal: 2 })?.[2].detail).toBeUndefined();
  });

  it.each(["failed", "cancelled", "expired"] as const)("marks the stopping stage of a %s run", (status) => {
    expect(statuses(stepsOf({ ...base, status, stage: "merging_songs" }))).toEqual([
      "done",
      "done",
      "failed",
      "pending",
      "pending",
    ]);
  });

  it("has no list when superseded", () => {
    expect(stepsOf({ ...base, status: "superseded" })).toBeNull();
  });
});
