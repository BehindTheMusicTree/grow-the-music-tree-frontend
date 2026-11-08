import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { chromium, type CDPSession } from "playwright-core";
import { z } from "zod";

export const runConfigSchema = z.object({
  schemaVersion: z.literal(1),
  repository: z.string().min(1),
  url: z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol)),
  browserExecutable: z.string().min(1),
  buildMode: z.enum(["production", "react-profile"]),
  buildCommand: z.string().min(1),
  apiOrigin: z.url().refine((value) => new URL(value).pathname === "/", "Expected an origin without an API path"),
  remoteSearch: z.enum(["live", "empty-fixture"]),
  backendRevision: z.string().min(1).nullable(),
  machine: z.string().min(1),
  power: z.string().min(1),
  notes: z.string(),
}).strict();

type TimedEntry = { startTime: number; duration: number; name: string };
type Commit = { startTime: number; duration: number | null };
type BrowserEvidence = {
  profiling: boolean;
  supported: string[];
  longTasks: TimedEntry[];
  events: (TimedEntry & { interactionId: number })[];
  commits: Commit[];
  keys: { startTime: number; nextFrameMs: number }[];
  marks: Record<string, number>;
};
type CaptureWindow = Window & { __growPerf: BrowserEvidence; __growPerfDrain: () => void };
type Dataset = { url: string; status: number; etag: string | null; decodedBytes: number; sha256: string };

const traceSchema = z.object({ traceEvents: z.array(z.object({
  name: z.string(), ph: z.string(), ts: z.number().optional(), dur: z.number().optional(),
  pid: z.number().optional(), tid: z.number().optional(),
})) });

export function summarizeTrace(input: unknown) {
  const { traceEvents: events } = traceSchema.parse(input);
  const start = events.find((event) => event.name === "typing-start");
  const end = events.find((event) => event.name === "typing-settled" && event.pid === start?.pid && event.tid === start?.tid);
  if (start?.ts === undefined || end?.ts === undefined || end.ts <= start.ts) throw new Error("Trace lacks a valid typing interval");
  const startTime = start.ts;
  const endTime = end.ts;
  const unionDuration = (names: string[]) => {
    const intervals = events.filter((event) => event.pid === start.pid && event.tid === start.tid && event.ph === "X" && names.includes(event.name))
      .map((event) => [Math.max(startTime, event.ts ?? 0), Math.min(endTime, (event.ts ?? 0) + (event.dur ?? 0))])
      .filter(([begin, finish]) => finish > begin).sort((a, b) => a[0] - b[0]);
    let total = 0;
    let previousEnd = startTime;
    for (const [begin, finish] of intervals) {
      total += Math.max(0, finish - Math.max(begin, previousEnd));
      previousEnd = Math.max(previousEnd, finish);
    }
    return total / 1000;
  };
  return {
    scriptingMs: unionDuration(["FunctionCall", "EvaluateScript", "RunMicrotasks"]),
    layoutMs: unionDuration(["Layout", "UpdateLayoutTree"]),
    paintMs: unionDuration(["Paint", "PrePaint"]),
  };
}

export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function summarize(evidence: BrowserEvidence) {
  const start = evidence.marks["typing-start"];
  const end = evidence.marks["typing-settled"];
  const typingEnd = evidence.marks["typing-end"];
  if (![start, typingEnd, end].every(Number.isFinite) || end <= start || typingEnd < start || typingEnd > end) {
    throw new Error("Missing or invalid typing interval");
  }
  const inside = (entry: { startTime: number }) => entry.startTime >= start && entry.startTime <= end;
  const longTasks = evidence.longTasks.filter((entry) => entry.startTime < end && entry.startTime + entry.duration > start);
  const events = evidence.events.filter(inside).filter((entry) => entry.interactionId > 0);
  const commits = evidence.commits.filter(inside);
  return {
    intervalMs: end - start,
    typingMs: evidence.marks["typing-end"] - start,
    settlementAfterTypingMs: end - evidence.marks["typing-end"],
    longTaskCount: evidence.supported.includes("longtask") ? longTasks.length : null,
    longTaskOverlapMs: evidence.supported.includes("longtask")
      ? longTasks.reduce((total, entry) => total + Math.min(end, entry.startTime + entry.duration) - Math.max(start, entry.startTime), 0)
      : null,
    eventTimingThresholdMs: 16,
    observedInteractionMaxMs: events.length ? Math.max(...events.map((entry) => entry.duration)) : null,
    inputToNextFrameMs: evidence.keys.filter(inside).map((key) => key.nextFrameMs),
    reactCommitCount: evidence.profiling ? commits.length : null,
    reactCommitDurationsMs: evidence.profiling ? commits.map((commit) => commit.duration) : null,
  };
}

function installObservers(profile: boolean): void {
  const state: BrowserEvidence = { profiling: profile, supported: [...PerformanceObserver.supportedEntryTypes], longTasks: [], events: [], commits: [], keys: [], marks: {} };
  const observers: PerformanceObserver[] = [];
  const record = (entries: PerformanceEntry[]) => {
    for (const entry of entries) {
      if (entry.entryType === "longtask") state.longTasks.push({ name: entry.name, startTime: entry.startTime, duration: entry.duration });
      if (entry.entryType === "event") {
        const event = entry as PerformanceEventTiming & { interactionId: number };
        state.events.push({ name: event.name, startTime: event.startTime, duration: event.duration, interactionId: event.interactionId });
      }
    }
  };
  for (const type of ["longtask", "event"]) {
    if (!state.supported.includes(type)) continue;
    const observer = new PerformanceObserver((list) => record(list.getEntries()));
    observer.observe({ type, buffered: true, ...(type === "event" ? { durationThreshold: 16 } : {}) });
    observers.push(observer);
  }
  window.addEventListener("keydown", (event) => {
    if (event.key.length !== 1) return;
    const startTime = event.timeStamp;
    requestAnimationFrame(() => state.keys.push({ startTime, nextFrameMs: performance.now() - startTime }));
  }, true);
  Object.assign(window, { __growPerf: state, __growPerfDrain: () => observers.forEach((observer) => record(observer.takeRecords())) });
  if (profile) {
    let nextId = 0;
    const renderers = new Map<number, unknown>();
    Object.assign(window, {
      __REACT_DEVTOOLS_GLOBAL_HOOK__: {
        supportsFiber: true,
        renderers,
        inject(renderer: unknown) { renderers.set(++nextId, renderer); return nextId; },
        onCommitFiberRoot(_id: number, root: { current: { actualDuration?: number } }) {
          const duration = root.current.actualDuration;
          state.commits.push({ startTime: performance.now(), duration: typeof duration === "number" ? duration : null });
        },
        onCommitFiberUnmount() {},
        onPostCommitFiberRoot() {},
      },
    });
  }
}

async function saveTrace(cdp: CDPSession, output: string): Promise<unknown> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const completed = new Promise<{ stream: string }>((resolve, reject) => {
    timer = setTimeout(() => reject(new Error("Trace completion timed out")), 15_000);
    cdp.once("Tracing.tracingComplete", (event) => {
      clearTimeout(timer);
      if (event.stream) resolve({ stream: event.stream });
      else reject(new Error("Chrome returned no trace stream"));
    });
  });
  let stream: string;
  try {
    const [, result] = await Promise.all([cdp.send("Tracing.end"), completed]);
    stream = result.stream;
  } finally {
    clearTimeout(timer);
  }
  const parts: Buffer[] = [];
  try {
    for (;;) {
      const chunk = await cdp.send("IO.read", { handle: stream });
      parts.push(Buffer.from(chunk.data, chunk.base64Encoded ? "base64" : "utf8"));
      if (chunk.eof) break;
    }
  } finally {
    await cdp.send("IO.close", { handle: stream });
  }
  const raw = Buffer.concat(parts);
  const compressed = gzipSync(raw);
  await writeFile(path.join(output, "trace.json.gz"), compressed, { flag: "wx" });
  return summarizeTrace(JSON.parse(raw.toString("utf8")));
}

export async function capture(configFile: string, output: string): Promise<void> {
  const config = runConfigSchema.parse(JSON.parse(await readFile(configFile, "utf8")));
  const repository = path.resolve(config.repository);
  const git = (...args: string[]) => execFileSync("git", ["-C", repository, ...args], { encoding: "utf8" }).trim();
  const packageJson = JSON.parse(await readFile(path.join(repository, "package.json"), "utf8"));
  const buildId = (await readFile(path.join(repository, ".next/BUILD_ID"), "utf8")).trim();
  const metadata = {
    ...config, repository, scenario: "search-bossa-v1", capturedAt: new Date().toISOString(),
    commit: git("rev-parse", "HEAD"), worktreeStatus: git("status", "--porcelain"),
    lockfileSha256: sha256(await readFile(path.join(repository, "pnpm-lock.yaml"))), buildId,
    captureScriptSha256: sha256(await readFile(fileURLToPath(import.meta.url))),
    appKit: packageJson.dependencies["@behindthemusictree/app-kit"],
    appKitUi: packageJson.dependencies["@behindthemusictree/app-kit-ui"],
    node: process.version, pnpm: execFileSync("pnpm", ["--version"], { encoding: "utf8" }).trim(),
    os: { platform: os.platform(), release: os.release(), architecture: os.arch(), cpu: os.cpus()[0]?.model },
    viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2, headless: true,
    httpCache: "disabled", cpuThrottling: 1, networkThrottling: "none", query: "bossa", keyDelayMs: 200,
  };
  await mkdir(output, { recursive: false });
  const manifest: Record<string, unknown> = { ...metadata, status: "running" };
  await writeFile(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2), { flag: "wx" });
  const errors: { kind: string; message: string }[] = [];
  const datasets: Dataset[] = [];
  const responses: Promise<void>[] = [];
  const requests = new Set<unknown>();
  let mockedRequests = 0;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let cdp: CDPSession | undefined;
  let tracing = false;
  try {
    browser = await chromium.launch({ executablePath: config.browserExecutable, headless: true });
    manifest.browserVersion = browser.version();
    const context = await browser.newContext({ viewport: metadata.viewport, deviceScaleFactor: 2, serviceWorkers: "block" });
    if (config.remoteSearch === "empty-fixture") {
      manifest.remoteFixture = { body: "[]", sha256: sha256("[]"), status: 200, delayMs: 0 };
      await context.route(/\/api\/grow-proxy\/(artists|library\/songs)\/search\/?\?/, async (route) => {
        mockedRequests += 1;
        await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      });
    }
    await context.addInitScript(installObservers, config.buildMode === "react-profile");
    const page = await context.newPage();
    page.setDefaultTimeout(60_000);
    page.on("console", (message) => { if (message.type() === "error") errors.push({ kind: "console", message: message.text() }); });
    page.on("pageerror", (error) => errors.push({ kind: "page", message: error.message }));
    page.on("request", (request) => { if (request.url().includes("/api/grow-proxy/")) requests.add(request); });
    page.on("requestfinished", (request) => requests.delete(request));
    page.on("requestfailed", (request) => {
      requests.delete(request);
      errors.push({ kind: "request", message: `${request.url()}: ${request.failure()?.errorText}` });
    });
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push({ kind: "http", message: `${response.status()} ${response.url()}` });
      const pathname = new URL(response.url()).pathname.replace(/\/$/, "");
      if (response.status() !== 200 || !["/api/grow-proxy/genre-playlists/tree", "/api/grow-proxy/regions/map", "/api/grow-proxy/regions/map/genres"].includes(pathname)) return;
      responses.push((async () => {
        const body = await response.body();
        datasets.push({ url: response.url(), status: response.status(), etag: await response.headerValue("etag"), decodedBytes: body.length, sha256: sha256(body) });
      })().catch((error: unknown) => { errors.push({ kind: "dataset", message: String(error) }); }));
    });
    cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    await cdp.send("Tracing.start", { transferMode: "ReturnAsStream", categories: "devtools.timeline,blink.user_timing,loading,v8" });
    tracing = true;
    const mark = async (name: string) => page.evaluate((name) => {
      (window as unknown as CaptureWindow).__growPerf.marks[name] = performance.mark(name).startTime;
    }, name);
    await page.goto(config.url, { waitUntil: "domcontentloaded" });
    await page.locator('.gtv-wheel-container[aria-busy="false"]').waitFor();
    const search = page.getByRole("combobox", { name: "Search", exact: true });
    await search.waitFor();
    await mark("tree-ready");
    await search.focus();
    const settle = async () => {
      const deadline = Date.now() + 60_000;
      let idleSince = Date.now();
      while (Date.now() < deadline) {
        if (requests.size > 0) idleSince = Date.now();
        if (Date.now() - idleSince >= 1000) return;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      throw new Error("API requests did not settle within 60 seconds");
    };
    await settle();
    await Promise.all(responses);
    if (datasets.length !== 3 || datasets.some((dataset) => dataset.status !== 200)) {
      throw new Error(`Expected three successful tree/region datasets; captured ${datasets.length}`);
    }
    await mark("search-ready");
    await mark("typing-start");
    await search.pressSequentially("bossa", { delay: 200 });
    await mark("typing-end");
    await settle();
    await page.getByText("Searching…", { exact: true }).waitFor({ state: "hidden" });
    await mark("typing-settled");
    if (await search.inputValue() !== "bossa") throw new Error("Search input did not retain bossa");
    const evidence = await page.evaluate(() => {
      const captureWindow = window as unknown as CaptureWindow;
      captureWindow.__growPerfDrain();
      return captureWindow.__growPerf;
    });
    if (evidence.keys.length !== 5) throw new Error(`Expected five keyboard samples; got ${evidence.keys.length}`);
    if (config.remoteSearch === "empty-fixture" && mockedRequests === 0) throw new Error("Remote search fixture was never requested");
    if (config.buildMode === "react-profile" && !evidence.commits.some((commit) => commit.duration !== null)) {
      throw new Error("React commit profiling unavailable; confirm next build --profile");
    }
    await writeFile(path.join(output, "observations.json"), JSON.stringify(evidence, null, 2), { flag: "wx" });
    manifest.metrics = summarize(evidence);
    manifest.status = "complete";
    // Superseded typeahead requests may be cancelled by React Query.
    if (errors.some((error) => !(error.kind === "request" && error.message.endsWith("net::ERR_ABORTED")))) {
      manifest.status = "invalid";
      throw new Error("Capture contains errors; inspect manifest.json");
    }
  } catch (error) {
    manifest.status = "failed";
    manifest.failure = String(error);
    throw error;
  } finally {
    try {
      if (tracing && cdp) manifest.traceMetrics = await saveTrace(cdp, output);
    } catch (error) {
      manifest.status = "failed";
      manifest.traceFailure = String(error);
    }
    await browser?.close();
    await Promise.all(responses);
    manifest.datasets = datasets;
    manifest.mockedRequests = mockedRequests;
    manifest.errors = errors;
    manifest.artifacts = await Promise.all(["trace.json.gz", "observations.json"].map(async (name) => {
      try { const bytes = await readFile(path.join(output, name)); return { name, bytes: bytes.length, sha256: sha256(bytes) }; }
      catch { return { name, missing: true }; }
    }));
    await writeFile(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2));
  }
  if (manifest.status !== "complete") throw new Error("Incomplete capture; inspect manifest.json");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [configFile, output, ...extra] = process.argv.slice(2);
  if (!configFile || !output || extra.length) {
    process.stderr.write("Usage: node scripts/perf-search.mts <config.json> <new-output-directory>\n");
    process.exitCode = 2;
  } else {
    capture(configFile, path.resolve(output)).catch((error: unknown) => {
      process.stderr.write(`${String(error)}\n`);
      process.exitCode = 1;
    });
  }
}
