# Trusted playback context

Configure both server-only values together: `EDGE_VIEWER_CONTEXT_TOKEN` authenticates the Cloudflare-injected `X-Btmt-Edge-Token`; `VIEWER_CONTEXT_TOKEN` authenticates the Next-to-Grow request. Both must contain at least 32 characters. Leaving both unset disables trusted country context. Setting only one fails configuration validation.

The Grow proxy forwards only an authenticated edge `CF-IPCountry`, stripping client-supplied internal country and credential headers. Direct-origin requests resolve to unknown country. Song, playlist-track and playback-context requests and responses use no-store and suppress conditional cache validators. Country-neutral tree endpoints keep their existing cache behavior.

The shared playback provider refreshes context on focus, online, explicit retry and before stale playback requests. Country changes replace list pagination and invalidate contextual queries; in-flight old-context responses are discarded. An initial context error displays a retry control. Only a known regional block is labelled “Unavailable in your country”; iframe failures remain generic.

The matching API must expose `playback/context/` and contextual availability. The frontend uses the published app-kit and app-kit-ui 33.1.0 packages, pinned exactly; validate with a frozen-lockfile install from npm. Infrastructure provisioning remains disabled until its feature flag is explicitly enabled; see the infrastructure operations document for staging verification.
