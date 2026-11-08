# Performance measurements

Run `scripts/perf-snapshot.sh https://grow-api-staging.themusictree.org/v1/`
from the repository root. The argument must include the API prefix. The script
records three sequential observations for identity and Brotli for each endpoint,
with response validators and cache metadata. Bytes are transferred response-body
bytes; curl does not decompress the downloaded body. Check `content-encoding`
before treating a Brotli request as a compressed response.

The 2026-11-07 baseline targets API revision
`4d8c7f50a4c2d02481063f01c98bb0c553c6136e`, verified separately through the staging
container image label. The public requests do not establish cold server-cache
latency. CDN compression may vary between requests even with the same validator.

## Browser search profiling

Follow [the search profiling procedure](search-profiling.md) to capture repeatable
production-build timing and separate React diagnostic runs. Start with
[the run configuration template](templates/search-run.json).

The [November 7 development baseline](2026-11-07-baseline.md) records historical
browser observations. [The PR #510 evidence report](search-pr-510.md) audits the
existing captures and records the controlled comparison and its limitations.
Network observations and development traces do not establish production client
performance improvements. Keep raw captures outside Git; commit procedures,
results and artifact checksums.
