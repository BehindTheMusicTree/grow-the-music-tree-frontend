# Search profiling

Use this procedure to compare the same search interaction across revisions. A
local production build backed by staging provides laboratory evidence, not field
performance. Keep development captures, ordinary production timing, and React
profiling results in separate comparisons.

## Prerequisites and revision selection

- Use the repository's Node and pnpm versions and `pnpm install --frozen-lockfile`.
- Install Chrome separately. `playwright-core` controls the supplied executable;
  it does not download a browser during installation.
- Create isolated worktrees for both revisions. Install their own lockfiles; do
  not link locally built shared packages into either worktree.
- Run the harness from the profiling worktree, even when the served application
  comes from an older worktree. Its dependencies resolve alongside the harness.
- Record the exact frontend revisions and backend revision when known. A missing
  backend revision remains `null`; response hashes establish only the identity
  of the captured payloads, not the complete backend state.

For PR #510, compare `e50783a74dc0563276148b471ddefa5e58a46e6a` with
`05ac685a555ff1243265b26882eb02138e86c805`. The historical November 7 browser
baseline predates this boundary and includes other differences.

## Build and serve each revision

From each application worktree, pin `GROW_API_ORIGIN` to the same read-only
staging origin for both build and runtime. Supply the required auth configuration
through local environment files or explicit environment variables. Anonymous
profiling needs no real Google credentials; nonempty synthetic auth values can
be used for this isolated local server. Do not attempt sign-in with them.

For ordinary production timing:

```bash
pnpm build
```

For a separate React diagnostic batch:

```bash
pnpm exec next build --profile
```

Stop the server before rebuilding. Both commands replace `.next`; never build
two modes concurrently in the same worktree. Profiling adds overhead. Record the
command actually used, rather than selecting a mode only in the capture config.

Grow uses standalone output. Following the installed Next.js `output` guide,
copy static assets before running its server:

```bash
cp -R public .next/standalone/
cp -R .next/static .next/standalone/.next/
env HOSTNAME=localhost PORT=3007 node .next/standalone/server.js
```

Use a different available port for the other revision. Keep API configuration
identical. Confirm the served worktree and successful build yourself: the harness
records the local build ID but cannot attest that a URL belongs to that build.
Do not count a failed or partially generated build as a valid sample.

## Configure and capture

Copy [the config template](templates/search-run.json) into the ignored output
parent, then fill every field. `repository` is the worktree serving the app;
`apiOrigin` is that server's upstream origin, without `/v1`. Paths resolve from
the harness's current working directory. Prefer absolute paths.

```bash
mkdir -p .performance-artifacts
cp docs/performance/templates/search-run.json .performance-artifacts/after.json
node scripts/perf-search.mts .performance-artifacts/after.json .performance-artifacts/production-after-01
```

The output parent must exist; the run directory must not. The harness refuses to
overwrite an existing directory. Run one browser capture at a time. Avoid builds
and tests during measurement; record other machine activity instead of assuming
the host is idle.

`remoteSearch` is required and has two explicit modes:

| Mode | Remote artist/song requests | Interpretation |
| --- | --- | --- |
| `live` | Reach the configured backend | End-to-end staging-backed observation; remote latency and failures affect settlement |
| `empty-fixture` | Return HTTP 200 with `[]`, immediately, in the browser automation layer | Controlled local-search experiment; excludes realistic remote results, latency and server work |

The fixture is never an automatic recovery path. The run manifest records its
body hash and intercepted request count. Tree and region data still come from
the configured server in both modes. Do not combine these modes in one result
series or describe fixture results as live production performance.

## Scenario contract: `search-bossa-v1`

Every sample launches a fresh anonymous headless Chrome, closes it afterward,
uses a 1400 × 900 viewport at device scale factor 2, blocks service workers,
disables the browser HTTP cache, and applies no CPU or network throttling.
These are cold browser-cache samples; CDN and backend caches are uncontrolled.

1. Start tracing and navigate to the configured tree URL.
2. Wait for the wheel container's `aria-busy="false"` and the Search combobox.
3. Focus Search to load lazy region data.
4. Wait for proxied API requests to be idle for one second and hash the three
   successful tree/region payloads. Missing payloads fail the sample.
5. Mark `typing-start`, type `bossa` with Playwright keyboard events and a nominal
   200 ms delay, then mark `typing-end`. Capture actual timestamps: scheduling
   and event processing can extend the nominal interval.
6. Wait for one second of proxied API inactivity and for `Searching…` to disappear,
   then mark `typing-settled`. Validate the input value and five keyboard samples.
7. Drain observers, save observations, stop tracing, and compress the trace.

Readiness and settlement have bounded timeouts. Failure produces a nonzero exit
and preserves the available trace and failure details. A manifest left with
`status: running` indicates interruption; it is not a completed sample. Do not
silently discard failed samples or retry until a desired number appears.

The wheel selector is deliberately tied to the renderer's existing busy contract;
the input is found through its accessible role and name. If those contracts
change, update the scenario version and procedure together.

## Evidence and metrics

Each directory contains:

- `manifest.json`: revisions, worktree status, lockfile and capture-script hashes,
  build ID, package versions, environment declarations, browser/system versions,
  settings, dataset hashes and decoded sizes, errors, metrics and artifact hashes.
- `observations.json`: timestamped long tasks, Event Timing entries, keyboard
  frame proxies, scenario marks and optional React root commits.
- `trace.json.gz`: Chrome trace with timeline, user timing, loading and V8 events.
  Decompress it before importing into Chrome DevTools Performance.

The config template describes inputs; the generated manifest is the results
record. Unknown environmental facts must be stated in `notes`.

| Metric | Definition and limits |
| --- | --- |
| `typingMs` | Wall time from typing start through completion of keyboard automation, including configured delays |
| `settlementAfterTypingMs` | Time to the settlement marker; includes the one-second idle requirement and remote work |
| `observedInteractionMaxMs` | Largest observed Event Timing duration with an interaction ID in the working interval; threshold 16 ms, browser quantization applies; missing samples are `null`, not zero |
| `inputToNextFrameMs` | Keydown timestamp to the next animation-frame callback; a diagnostic proxy, not a completed paint or INP |
| `longTaskCount`, `longTaskOverlapMs` | Tasks overlapping typing start through settlement and their clipped durations; unsupported observation is `null` |
| `scriptingMs`, `layoutMs`, `paintMs` | Union of matching complete trace spans on the thread containing the scenario marks, clipped to that interval; nested spans within a category are counted once |
| React root commits | Callback counts and root `actualDuration` in React profiling mode; ordinary builds report `null` |

Trace scripting covers `FunctionCall`, `EvaluateScript`, and `RunMicrotasks`;
layout covers `Layout` and `UpdateLayoutTree`; paint covers `Paint` and `PrePaint`.
These are selected inclusive spans, not an exhaustive CPU accounting, and category
totals should not be summed. A zero means no matching spans, not proof of no work.

The React observer is a minimal DevTools hook, not an exported React DevTools
session. It does not walk fibers or prove which components rendered. Existing
render-spy tests in the owning package provide separate regression evidence.
Do not use root commits to claim that the tree rendered zero times.

Keep navigation analysis separate. Traces include navigation and readiness marks;
the automated comparison metrics cover search only. Development compilation and
paint observations from historical captures do not establish production LCP or INP.
Use the existing Sentry integration for any later field-data validation.

## Compare runs

Collect at least five valid runs per revision and build mode, alternating before
and after. Exclude pilot runs. Record failed runs alongside valid ones. Compare
only the same scenario, build mode, remote mode, browser, viewport, hardware,
throttling and dataset hashes. Explain tooling-only dirty worktrees explicitly;
runtime source must match the declared revision.

Publish per-run measurements and the median and range for each series. With five
samples, avoid percentile or statistical-significance claims. If settings or data
differ, failures dominate, or results overlap substantially, call the result
inconclusive. Separate the timing observation from any causal explanation.

Generate a checked JSON report from explicitly selected completed runs:

```bash
node scripts/perf-search-report.mts .performance-artifacts/production-before-0[1-5] .performance-artifacts/production-after-0[1-5] > .performance-artifacts/production-comparison.json
```

The report command verifies artifact sizes and hashes, rejects incomplete or
duplicate runs, requires at least five samples per revision/build-mode group,
and rejects inconsistent settings, capture-script hashes or dataset hashes.
It reports each run and group medians/ranges; it does not infer significance.
Supply failed runs separately in the written report, including their failure
reason and manifest hash. They cannot enter a successful comparison.

## Retention and sharing

Commit procedures, small reports and artifact indexes. Keep raw captures in the
ignored output directory during analysis, then copy them to a persistent archive
outside the worktree before cleanup. A local archive is useful recovery storage
but does not make evidence available to collaborators.

For shared retention, prefer private object storage with immutable run paths,
checksums, access controls and an explicit retention policy. GitHub Actions
artifacts are suitable for temporary PR evidence when their expiry is recorded;
promote important baselines before expiry. Do not use a GitHub Release as generic
trace storage or create a release for profiling.

Review URLs, query strings, captured text and error messages before upload.
Record the object identifier, retention/expiry, manifest checksum and individual
artifact checksums in the report. If redacted copies are shared, hash them
separately and describe the transformation. Do not archive Chrome profiles,
cookies, environment files or credentials. The harness closes its own browser;
it does not delete older profiles created by other sessions.

## Validation

Run the focused extraction tests and the repository's required validation:

```bash
pnpm exec vitest run scripts/perf-search.test.mts
pnpm exec vitest run scripts/perf-search-report.test.mts
pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

Keep validation outside measurement batches. Open at least one generated trace in
Chrome DevTools and verify the typing marks and result manifest. Performance CI
thresholds remain deferred until this procedure demonstrates stable results.
