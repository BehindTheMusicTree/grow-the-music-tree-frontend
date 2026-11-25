# PR #510 search evidence

The controlled local experiment shows less search-related scripting after PR
#510. It does not establish a production user performance improvement. Remote
artist/song searches returned empty fixtures, the host was a shared developer
laptop, and only five samples were collected per revision and build mode.

## Scope and revisions

Captured on November 8, 2026 with [search-bossa-v1](search-profiling.md): focus
Search on the loaded genre tree, type `bossa` at a nominal 200 ms per character,
then wait for settlement. Samples alternate before/after, each in a fresh browser.

| Revision | Commit | Role |
| --- | --- | --- |
| Before | `e50783a74dc0563276148b471ddefa5e58a46e6a` | Parent of the merged PR |
| After | `05ac685a555ff1243265b26882eb02138e86c805` | Merged PR #510 |

Each revision uses its own frozen lockfile and published package versions.
The after worktree contains profiling tooling/documentation changes; application
runtime source matches the declared commit. Ordinary production builds and
`next build --profile` are separate series served by the standalone server.

Read-only staging supplied identical tree and region payloads in every included
sample. Its health endpoint reported backend 15.1.0, revision
`080cecba004b293166ecacf2012c9744f0ff934d`. Browser automation explicitly returned
HTTP 200 with `[]` for remote artist/song search. This isolates local processing
from remote search availability but excludes realistic remote results and latency.

The viewport was 1400 × 900 at device scale factor 2. Browser HTTP cache was
disabled, service workers blocked, and no CPU/network throttling applied. The
MacBookPro15,4 was on AC power with unrelated background activity; it was not a
dedicated benchmark host. Backend/CDN caches were uncontrolled. No builds or
tests ran during either measurement batch.

## Interpreting the measurements

The tables below report medians and full observed ranges, with per-run values
retained separately. Selected scripting spans are inclusive unions of
`FunctionCall`, `EvaluateScript`, and `RunMicrotasks` on the marked renderer thread.
They are not exhaustive CPU time. Layout and paint categories are also inclusive;
do not add categories together.

Event Timing maxima are observed entries above the configured 16 ms threshold,
with browser quantization. They are not field INP. Keydown-to-next-frame maxima
measure the next animation-frame callback, not completed paint. Typing wall time
includes the deliberate key delays; settlement includes the one-second API-idle
requirement. Five samples do not establish statistical significance or tail
percentiles.

React profiling reports root callback counts and summed root `actualDuration`.
The hook does not walk component fibers, so these measurements cannot establish
that the tree rendered zero times. Ordinary builds have unavailable React metrics,
recorded as `null`, rather than zero.

## Controlled ordinary production builds

Browser: Chrome `156.0.8078.80`; Node `v26.5.0`; pnpm `11.5.2`; OS `darwin 24.6.0 x64`. Exact build IDs, package versions and lockfile hashes are in the artifact index.

| Metric | Before median [min, max] | After median [min, max] |
| --- | --- | --- |
| Selected scripting (ms) | 309.2 [285.7, 373.5] | 42.6 [40.0, 51.3] |
| Layout (ms) | 20.5 [19.2, 22.5] | 19.2 [19.0, 20.6] |
| Paint (ms) | 13.2 [12.1, 15.2] | 13.6 [13.1, 15.1] |
| Long tasks | 4.0 [1.0, 4.0] | 0.0 [0.0, 0.0] |
| Long-task overlap (ms) | 206.0 [50.0, 247.0] | 0.0 [0.0, 0.0] |
| Observed Event Timing maximum (ms) | 240.0 [208.0, 368.0] | 64.0 [56.0, 80.0] |
| Maximum keydown-to-frame proxy (ms) | 56.0 [50.6, 70.0] | 16.6 [9.8, 23.8] |
| Typing wall time (ms) | 1282.3 [1273.3, 1361.7] | 1056.0 [1046.2, 1116.2] |
| Settlement after typing (ms) | 1144.6 [1043.8, 1155.2] | 1050.0 [1041.2, 1106.7] |

| Run | Scripting ms | Event Timing max ms | Long tasks | Root callbacks | Root duration total ms |
| --- | --- | --- | --- | --- | --- |
| before-01 | 373.5 | 368.0 | 4.0 | unavailable | unavailable |
| after-01 | 40.0 | 80.0 | 0.0 | unavailable | unavailable |
| before-02 | 327.9 | 240.0 | 4.0 | unavailable | unavailable |
| after-02 | 51.3 | 72.0 | 0.0 | unavailable | unavailable |
| before-03 | 303.3 | 320.0 | 1.0 | unavailable | unavailable |
| after-03 | 42.6 | 64.0 | 0.0 | unavailable | unavailable |
| before-04 | 309.2 | 232.0 | 4.0 | unavailable | unavailable |
| after-04 | 44.0 | 56.0 | 0.0 | unavailable | unavailable |
| before-05 | 285.7 | 208.0 | 1.0 | unavailable | unavailable |
| after-05 | 42.1 | 56.0 | 0.0 | unavailable | unavailable |

The selected scripting ranges do not overlap in this small series, and the
observed long-task count fell to zero in all five after samples. This supports
less local search work under these conditions. Paint ranges overlap; these data
do not establish a paint improvement. The experiment covers the full PR boundary,
not an isolated attribution to one indexing or subscription change.

## Separate React profiling builds

Instrumentation changes execution cost. Compare these samples only with each
other, not with the ordinary-build measurements above.

| Metric | Before median [min, max] | After median [min, max] |
| --- | --- | --- |
| Selected scripting (ms) | 386.8 [362.8, 601.2] | 64.9 [52.7, 76.3] |
| Layout (ms) | 21.2 [20.0, 23.6] | 22.0 [19.4, 25.9] |
| Paint (ms) | 13.9 [13.1, 44.2] | 16.0 [15.2, 20.6] |
| Long tasks | 5.0 [4.0, 5.0] | 0.0 [0.0, 0.0] |
| Long-task overlap (ms) | 293.0 [211.0, 511.0] | 0.0 [0.0, 0.0] |
| Observed Event Timing maximum (ms) | 296.0 [216.0, 392.0] | 224.0 [64.0, 584.0] |
| Maximum keydown-to-frame proxy (ms) | 98.7 [57.2, 109.0] | 13.6 [8.2, 15.6] |
| Typing wall time (ms) | 1375.5 [1288.7, 1435.8] | 1177.4 [1056.5, 1544.1] |
| Settlement after typing (ms) | 1139.9 [1050.5, 1147.3] | 1046.9 [1045.4, 1057.2] |
| Root callbacks | 13.0 [13.0, 14.0] | 18.0 [14.0, 20.0] |
| Summed root actualDuration (ms) | 209.2 [183.0, 285.4] | 32.0 [28.1, 35.3] |

| Run | Scripting ms | Event Timing max ms | Long tasks | Root callbacks | Root duration total ms |
| --- | --- | --- | --- | --- | --- |
| before-01 | 362.9 | 216.0 | 4.0 | 14.0 | 200.3 |
| after-01 | 76.3 | 584.0 | 0.0 | 20.0 | 35.3 |
| before-02 | 386.8 | 376.0 | 5.0 | 13.0 | 209.2 |
| after-02 | 52.7 | 112.0 | 0.0 | 15.0 | 28.1 |
| before-03 | 362.8 | 288.0 | 4.0 | 13.0 | 183.0 |
| after-03 | 56.9 | 64.0 | 0.0 | 14.0 | 31.0 |
| before-04 | 601.2 | 296.0 | 5.0 | 13.0 | 225.6 |
| after-04 | 64.9 | 224.0 | 0.0 | 19.0 | 32.0 |
| before-05 | 466.6 | 392.0 | 5.0 | 13.0 | 285.4 |
| after-05 | 68.3 | 456.0 | 0.0 | 18.0 | 34.1 |

Root duration ranges are lower after the change, while callback counts increase.
Profiling-build Event Timing ranges overlap substantially, including after-run
outliers. Those interaction measurements are inconclusive; lower recorded React
work does not by itself establish improved responsiveness.

All per-run scalar metrics and group distributions, without rounding, are
retained in [the checked results](search-pr-510-results.json). Both measured
batches completed without failed captures; pilots remain excluded.

## Dataset identity

| Proxied path | Decoded bytes | SHA-256 |
| --- | --- | --- |
| `/api/grow-proxy/genre-playlists/tree` | 1728205 | `2050235cf0dd2949f61a0b8454ef3469e8d42c171835dd9b795ee4aef22847af` |
| `/api/grow-proxy/regions/map` | 1234244 | `15e3a52d66506115e9b2fbbc204457eda6c201603a00d7f81741cbd755798021` |
| `/api/grow-proxy/regions/map/genres` | 1053473 | `853f9f9cd67c489a894a634f9f3af70f1d6dbb8ddea0e583fa2de9612b2c730b` |

## Historical evidence and excluded attempts

The four pre-existing files under `/tmp/grow-perf-evidence` were audited and copied
to the persistent archive. Their exact original and archived checksums appear in
[the artifact index](search-pr-510-artifacts.json).

The two Chrome traces contain 74,228 and 49,487 events, respectively, but neither
contains the new typing boundary marks or an embedded frontend revision/browser
version. The earlier written baseline attributes its capture to
`965cc62b12b805848770bc2627170a2de967a5e9`; that attribution is not embedded in the
trace. The exact after-capture commit is unverified. The custom React files contain
253 and 181 callbacks over their whole sessions. These totals span unmatched
activity and are not comparable component render counts. Historical tree payload
size also differs from the new dataset. Keep these files for diagnosis, without
deriving a performance improvement from them.

The first live pilot (`pilot-before`) received HTTP 503 from song search and
failed the bounded API-settlement wait. Its available trace and failure manifest
are retained. There is no successful live end-to-end comparison. Subsequent pilots
(`pilot-controlled-before`, `pilot-controlled-after`, `pilot-profile-before`) are
excluded from all result tables. The controlled mode was selected explicitly
after the live failure, not activated automatically by the harness.

An initial build attempt exhausted disk space. Its generated standalone output
was removed, both revisions were rebuilt successfully, and only completed builds
were used for measured samples. Earlier exploratory browser activity is not part
of the measured series.

## Retention and reproduction

The `production-after-01` trace was imported into Chrome 156 DevTools Performance
and displayed as a generic timeline. Across all twenty measured runs, trace
typing-boundary durations agree with the observation intervals within 1 ms.
The profiling extractor/report tests, lint, typecheck, production build, full test
suite and coverage thresholds passed.

Raw captures are deliberately outside Git. The archive is
`$HOME/.local/share/themusictree/performance/search-pr-510/2026-11-08`, with immutable
run directory names and file checksums recorded in the artifact index. It is a
local archive, not a collaborator-accessible artifact service or an established
off-device backup. No automated expiry is configured; retain it until deliberately
superseded or removed. A future upload should use private object storage and add
the object identifiers and retention policy to the index after reviewing content.
No Chrome profiles, credentials or environment files are archived.

Follow [the procedure](search-profiling.md) and use the same capture script hash
and dataset hashes to reproduce the experiment. The index records build IDs,
lockfile hashes, package versions, manifest checksums and individual artifact
checksums. Verify these before importing a decompressed trace into DevTools or
running the report command on the archived run directories. Failed samples cannot
enter the report command's successful comparison.

Production validation remains a separate task: use representative live remote
results and field telemetry for real user interaction latency. No production claim
or CI performance threshold follows from this small laboratory series.
