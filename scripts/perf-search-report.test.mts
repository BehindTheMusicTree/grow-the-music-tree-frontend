import { afterEach, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { distribution, report } from "./perf-search-report.mjs";

let directory: string | undefined;
afterEach(async () => { if (directory) await rm(directory, { recursive: true }); });

it("preserves unavailable metrics and reports the median and full range", () => {
  expect(distribution([12, null, 4, 10, 8])).toEqual({ samples: 4, median: 9, min: 4, max: 12 });
  expect(distribution([null])).toEqual({ samples: 0, median: null, min: null, max: null });
});

it("rejects failed captures and duplicate run directories", async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "grow-perf-report-"));
  await writeFile(path.join(directory, "manifest.json"), JSON.stringify({ status: "failed" }));
  await expect(report([directory])).rejects.toThrow();
  await expect(report([directory, directory])).rejects.toThrow("distinct");
});

it("verifies the evidence before comparing five matching samples", async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "grow-perf-report-"));
  const bytes = Buffer.from("fixture");
  const hash = createHash("sha256").update(bytes).digest("hex");
  const manifest = {
    schemaVersion: 1, status: "complete", commit: "test", scenario: "test", buildMode: "production", remoteSearch: "live",
    captureScriptSha256: hash, browserVersion: "test", machine: "test", power: "AC", backendRevision: null,
    buildCommand: "pnpm build", buildId: "test", lockfileSha256: hash, appKit: "test", appKitUi: "test",
    node: "test", pnpm: "test", os: { platform: "test", release: "test", architecture: "test", cpu: "test" },
    apiOrigin: "https://api.example.com", viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2,
    headless: true, cpuThrottling: 1, networkThrottling: "none", httpCache: "disabled", query: "bossa", keyDelayMs: 200,
    datasets: ["tree", "regions", "genres"].map((name) => ({ url: `https://example.com/${name}`, sha256: hash })),
    artifacts: ["trace.json.gz", "observations.json"].map((name) => ({ name, bytes: bytes.length, sha256: hash })),
    metrics: {
      typingMs: 1000, settlementAfterTypingMs: 1000, longTaskCount: 0, longTaskOverlapMs: 0,
      observedInteractionMaxMs: null, inputToNextFrameMs: [12], reactCommitCount: null, reactCommitDurationsMs: null,
    },
    traceMetrics: { scriptingMs: 12, layoutMs: 4, paintMs: 2 },
  };
  const runs = [];
  for (let i = 0; i < 5; i++) {
    const run = path.join(directory, String(i));
    await mkdir(run);
    for (const artifact of manifest.artifacts) await writeFile(path.join(run, artifact.name), bytes);
    await writeFile(path.join(run, "manifest.json"), JSON.stringify({ ...manifest, capturedAt: `sample-${i}` }));
    runs.push(run);
  }
  const result = await report(runs);
  expect(result.groups[0].metrics.scriptingMs.median).toBe(12);
  await expect(report(runs.slice(0, 4))).rejects.toThrow("need at least five");
  const secondManifest = await readFile(path.join(runs[1], "manifest.json"));
  await writeFile(path.join(runs[1], "manifest.json"), await readFile(path.join(runs[0], "manifest.json")));
  await expect(report(runs)).rejects.toThrow("samples must be independent");
  await writeFile(path.join(runs[1], "manifest.json"), secondManifest);
  const aliasRoot = directory;
  const aliases = await Promise.all(runs.map(async (_run, i) => {
    const alias = path.join(aliasRoot, `alias-${i}`);
    await symlink(runs[0], alias, "dir");
    return alias;
  }));
  await expect(report(aliases)).rejects.toThrow("samples must be independent");
  const changed = { ...manifest, datasets: manifest.datasets.map((dataset) => ({ ...dataset, sha256: "changed" })) };
  await writeFile(path.join(runs[0], "manifest.json"), JSON.stringify(changed));
  await expect(report(runs)).rejects.toThrow("different settings");
  await writeFile(path.join(runs[0], "observations.json"), "corrupt");
  await expect(report(runs)).rejects.toThrow("integrity failure");
});
