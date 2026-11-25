import { describe, expect, it } from "vitest";
import { runConfigSchema, summarize, summarizeTrace } from "./perf-search.mjs";

describe("performance evidence", () => {
  it("rejects missing configuration rather than profiling an assumed environment", () => {
    expect(() => runConfigSchema.parse({ url: "http://localhost:3000" })).toThrow();
  });

  it("requires explicit interval boundaries", () => {
    expect(() => summarize({ profiling: false, supported: [], longTasks: [], events: [], commits: [], keys: [], marks: {} })).toThrow("typing interval");
    expect(() => summarizeTrace({ traceEvents: [] })).toThrow("typing interval");
    expect(() => summarizeTrace({ traceEvents: "broken" })).toThrow();
  });

  it("clips long tasks to the interval and distinguishes missing event samples from zero latency", () => {
    const result = summarize({
      profiling: true, supported: ["longtask", "event"], marks: { "typing-start": 100, "typing-end": 200, "typing-settled": 300 },
      longTasks: [{ name: "task", startTime: 50, duration: 100 }, { name: "task", startTime: 250, duration: 100 }],
      events: [], commits: [{ startTime: 90, duration: 50 }, { startTime: 150, duration: 12 }],
      keys: [{ startTime: 150, nextFrameMs: 8 }],
    });
    expect(result.longTaskOverlapMs).toBe(100);
    expect(result.observedInteractionMaxMs).toBeNull();
    expect(result.reactCommitDurationsMs).toEqual([12]);
    expect(result.inputToNextFrameMs).toEqual([8]);
  });

  it("does not double count nested trace spans or include another renderer", () => {
    const result = summarizeTrace({ traceEvents: [
      { name: "typing-start", ph: "I", ts: 1000, pid: 1, tid: 2 },
      { name: "typing-settled", ph: "I", ts: 11000, pid: 1, tid: 2 },
      { name: "FunctionCall", ph: "X", ts: 0, dur: 5000, pid: 1, tid: 2 },
      { name: "RunMicrotasks", ph: "X", ts: 2000, dur: 2000, pid: 1, tid: 2 },
      { name: "EvaluateScript", ph: "X", ts: 9000, dur: 5000, pid: 1, tid: 2 },
      { name: "FunctionCall", ph: "X", ts: 1000, dur: 10000, pid: 3, tid: 4 },
      { name: "Layout", ph: "X", ts: 5000, dur: 1000, pid: 1, tid: 2 },
    ] });
    expect(result).toEqual({ scriptingMs: 6, layoutMs: 1, paintMs: 0 });
  });
});
