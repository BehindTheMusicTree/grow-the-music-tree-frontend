# Frontend authentication

This doc describes how the frontend implements the backend’s unified account (Google + Spotify) and session handling. See backend docs for endpoint contracts and linking rules.

## Session

- **Shape**: One format for both Google and Spotify sign-in: `{ accessToken, refreshToken, expiresAt }` (see `Session` in `src/types/Session.ts`).
- **Storage**: Session is stored in **localStorage** under the key `"session"`. It is restored on app load so auth survives page refresh and new tabs.
- **Usage**: The same JWT is sent as `Authorization: Bearer <accessToken>` for all API calls regardless of sign-in method.

## Login options

- **Sign in with Google**: Redirects to Google OAuth; callback page reads `code`, calls `POST /api/{version}/auth/google/` with `{ code }`, then stores the returned session.
- **Sign in with Spotify**: Same pattern with `POST /api/{version}/auth/spotify/` and Spotify OAuth.

Linking is handled by the backend (by email). No “link account” or “choose account” UI is required.

## Checking provider state

- **Spotify linked**: `GET /me/spotify/` — 200 and non-empty = linked; 403 with `details.code === "spotify_authorization_required"` = not linked. The frontend caches “Spotify required” in sessionStorage to avoid repeated 403s; cache is cleared on logout and on successful Spotify profile fetch.
- **Google linked**: No dedicated endpoint; inferred from having obtained the session via Google auth (or a future “linked providers” API).

## Auth error handling

Auth endpoints return 401 (or 500 for some misconfig). The frontend maps `details.code` to app error codes and messages:

| `details.code` | App code | Where handled |
|----------------|----------|----------------|
| `google_oauth_code_invalid_or_expired` | `BACKEND_GOOGLE_OAUTH_CODE_INVALID_OR_EXPIRED` | Google callback: show auth popup, redirect to `/` (no message) |
| `google_authentication_error` | `BACKEND_GOOGLE_AUTHENTICATION_ERROR` | Google callback: show `details.message` |
| `google_oauth_redirect_uri_mismatch`, `google_oauth_invalid_client` | `BACKEND_GOOGLE_OAUTH_MISCONFIGURED` | Google callback: show “Sign-in is temporarily misconfigured…” or `details.message` |
| `spotify_authentication_error` | `BACKEND_SPOTIFY_AUTHENTICATION_ERROR` | Spotify callback: show `details.message` |
| `spotify_user_not_in_allowlist` | `BACKEND_SPOTIFY_USER_NOT_IN_ALLOWLIST` | Spotify callback: show backend message (allowlist instructions) |

These auth-detail errors are rethrown from `useFetchWrapper`, `useGoogleAuth`, and `useSpotifyAuth` so callback pages can show the correct message instead of a generic one.

## Linking another provider

Same as sign-in: user goes through the provider’s OAuth and the callback sends the code to the same backend endpoint. If the email matches an existing account, the backend links the provider and returns the same session.
