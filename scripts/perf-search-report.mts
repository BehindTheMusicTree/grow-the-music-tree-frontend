import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const metricSchema = z.number().finite().nonnegative().nullable();
const manifestSchema = z.object({
  schemaVersion: z.literal(1), status: z.literal("complete"), commit: z.string(),
  scenario: z.string(), buildMode: z.enum(["production", "react-profile"]), remoteSearch: z.enum(["live", "empty-fixture"]), captureScriptSha256: z.string(),
  buildCommand: z.string(), buildId: z.string(), lockfileSha256: z.string(), appKit: z.string(), appKitUi: z.string(),
  node: z.string(), pnpm: z.string(), os: z.object({ platform: z.string(), release: z.string(), architecture: z.string(), cpu: z.string() }),
  browserVersion: z.string(), machine: z.string(), power: z.string(), backendRevision: z.string().nullable(), apiOrigin: z.string(),
  viewport: z.object({ width: z.number(), height: z.number() }), deviceScaleFactor: z.number(),
  headless: z.boolean(), cpuThrottling: z.number(), networkThrottling: z.string(), httpCache: z.string(),
  query: z.string(), keyDelayMs: z.number(),
  datasets: z.array(z.object({ url: z.url(), sha256: z.string() })).length(3),
  artifacts: z.array(z.object({ name: z.enum(["trace.json.gz", "observations.json"]), bytes: z.number(), sha256: z.string() })).length(2)
    .refine((artifacts) => new Set(artifacts.map((artifact) => artifact.name)).size === 2),
  metrics: z.object({
    typingMs: metricSchema, settlementAfterTypingMs: metricSchema, longTaskCount: metricSchema,
    longTaskOverlapMs: metricSchema, observedInteractionMaxMs: metricSchema,
    inputToNextFrameMs: z.array(z.number()), reactCommitCount: metricSchema,
    reactCommitDurationsMs: z.array(metricSchema).nullable(),
  }),
  traceMetrics: z.object({ scriptingMs: metricSchema, layoutMs: metricSchema, paintMs: metricSchema }),
});

export function distribution(values: (number | null)[]) {
  const sorted = values.filter((value): value is number => value !== null).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return {
    samples: sorted.length,
    median: sorted.length ? sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2 : null,
    min: sorted[0] ?? null, max: sorted.at(-1) ?? null,
  };
}

export async function report(directories: string[]) {
  if (!directories.length || new Set(directories.map((directory) => path.resolve(directory))).size !== directories.length) {
    throw new Error("Supply distinct run directories");
  }
  const runs = await Promise.all(directories.map(async (directory) => {
    const raw = await readFile(path.join(directory, "manifest.json"));
    const manifest = manifestSchema.parse(JSON.parse(raw.toString("utf8")));
    for (const artifact of manifest.artifacts) {
      const bytes = await readFile(path.join(directory, artifact.name));
      if (bytes.length !== artifact.bytes || createHash("sha256").update(bytes).digest("hex") !== artifact.sha256) {
        throw new Error(`Artifact integrity failure: ${directory}/${artifact.name}`);
      }
    }
    const { metrics, traceMetrics, ...settings } = manifest;
    const identity = JSON.stringify({
      scenario: settings.scenario, remoteSearch: settings.remoteSearch, browser: settings.browserVersion,
      machine: settings.machine, power: settings.power, viewport: settings.viewport, scale: settings.deviceScaleFactor,
      headless: settings.headless, cpu: settings.cpuThrottling, network: settings.networkThrottling, cache: settings.httpCache,
      api: settings.apiOrigin, backend: settings.backendRevision, query: settings.query, delay: settings.keyDelayMs,
      script: settings.captureScriptSha256,
      os: settings.os, node: settings.node, pnpm: settings.pnpm,
      datasets: settings.datasets.map((dataset) => [new URL(dataset.url).pathname, dataset.sha256]).sort(),
    });
    return {
      directory, commit: manifest.commit, buildMode: manifest.buildMode, identity,
      buildIdentity: JSON.stringify([manifest.buildCommand, manifest.buildId, manifest.lockfileSha256, manifest.appKit, manifest.appKitUi]),
      manifestSha256: createHash("sha256").update(raw).digest("hex"),
      metrics: {
        ...traceMetrics, typingMs: metrics.typingMs, settlementAfterTypingMs: metrics.settlementAfterTypingMs,
        longTaskCount: metrics.longTaskCount, longTaskOverlapMs: metrics.longTaskOverlapMs,
        observedInteractionMaxMs: metrics.observedInteractionMaxMs,
        inputToNextFrameMaxMs: metrics.inputToNextFrameMs.length ? Math.max(...metrics.inputToNextFrameMs) : null,
        reactCommitCount: metrics.reactCommitCount,
        reactRootTotalMs: metrics.reactCommitDurationsMs?.every((duration) => duration !== null)
          ? metrics.reactCommitDurationsMs.reduce<number>((sum, duration) => sum + (duration ?? 0), 0) : null,
      },
    };
  }));
  if (new Set(runs.map((run) => run.manifestSha256)).size !== runs.length) {
    throw new Error("Repeated capture manifest; samples must be independent");
  }
  if (new Set(runs.map((run) => run.identity)).size !== 1) throw new Error("Runs have different settings, capture scripts, or datasets");
  const groups = Map.groupBy(runs, (run) => `${run.commit}:${run.buildMode}`);
  for (const [group, samples] of Array.from(groups)) {
    if (samples.length < 5) throw new Error(`${group} has ${samples.length} samples; need at least five`);
    if (new Set(samples.map((sample) => sample.buildIdentity)).size !== 1) throw new Error(`${group} contains different builds or dependencies`);
  }
  return {
    runs: runs.map(({ identity: _identity, buildIdentity: _buildIdentity, ...run }) => run),
    groups: Array.from(groups).map(([group, samples]) => ({
      group, count: samples.length,
      metrics: Object.fromEntries(Object.keys(samples[0].metrics).map((key) => [key, distribution(samples.map((sample) => sample.metrics[key as keyof typeof sample.metrics]))])),
    })),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  report(process.argv.slice(2)).then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)).catch((error: unknown) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  });
}
