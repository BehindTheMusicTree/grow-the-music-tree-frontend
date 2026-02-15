# Backend: Auth design (unified account)

Recommended backend auth model for an app that supports multiple sign-in providers (e.g. Google, Spotify). The frontend expects this contract.

## Industry-standard approach

- **One account per user** – A user can sign in with Google, Spotify, or both; the backend links them to a single account (e.g. by email).
- **One session format** – Regardless of provider, the backend returns the same session shape: `accessToken`, `refreshToken`, `expiresAt`. The client sends `Authorization: Bearer <accessToken>` on every request.
- **One code-exchange endpoint per provider** – e.g. `POST /auth/google/`, `POST /auth/spotify/`. Each accepts that provider’s authorization code and returns the same session. This is common practice: clear contracts, easy to add/remove providers, same session format everywhere.

A single “unified” URL (e.g. `POST /auth` with `provider` in the body) is not required; “unified” here means one account and one session type, not one endpoint.

## Endpoints (no auth required)

| Action | Endpoint | Body | Response |
|--------|----------|------|----------|
| Exchange Google code | `POST auth/google/` | `{ "code": "<authorization_code>" }` | Session (see below) |
| Exchange Spotify code | `POST auth/spotify/` | `{ "code": "<authorization_code>" }` | Session (+ optional `spotifyUser`) |

## Session response shape

Same for both providers:

```json
{
  "accessToken": "<jwt_or_session_token>",
  "refreshToken": "<refresh_token>",
  "expiresAt": <unix_timestamp_ms>
}
```

- **accessToken** – Used in `Authorization: Bearer <accessToken>` for all API calls.
- **refreshToken** – Used by the backend (or a refresh endpoint) to issue a new access token when it expires.
- **expiresAt** – Unix timestamp in **milliseconds** for client-side expiry handling.

## Backend logic (create vs link)

- **By provider id** – If a user already exists with this `google_id` or `spotify_id`, update tokens/profile and return a session (same account).
- **By email (linking)** – If no user with that provider id exists but the provider returned an **email**, look up by email (case-insensitive). If found, link the new provider to that user and return the same session. No second account.
- **New user** – If neither provider id nor email matches, create a new user with that provider’s id, email, and tokens.

The frontend does not need a “link account” step; the backend decides create vs link from provider id and email.

## Auth error response shape

On failure, auth endpoints should return **401 Unauthorized** (or 500 for misconfiguration) with a structured body so the frontend can show the right message:

```json
{
  "code": 1001,
  "message": "Unauthorized",
  "success": false,
  "details": {
    "message": "Human-readable message",
    "code": "detail_code"
  }
}
```

The frontend uses **`details.code`** to choose the message or flow. Recommended `details.code` values:

**Google**

| `details.code` | Meaning |
|----------------|---------|
| `google_authentication_error` | Generic Google auth failure |
| `google_oauth_code_invalid_or_expired` | Code already used or expired |
| `google_oauth_redirect_uri_mismatch` | Redirect URI does not match Google Console |
| `google_oauth_invalid_client` | Client id/secret misconfigured |

**Spotify**

| `details.code` | Meaning |
|----------------|---------|
| `spotify_authentication_error` | Generic Spotify auth failure |
| `spotify_user_not_in_allowlist` | App in Development Mode, user not in allowlist |

## Checking if Spotify is linked

- **`GET /me/spotify/`** with the app JWT:
  - **200** and non-empty → Spotify is linked.
  - **403** with `details.code === "spotify_authorization_required"` → User is logged in but Spotify is not linked.

Google linked state can be inferred from how the user signed in or a future “linked providers” API.

## Summary

| Backend concern | Recommendation |
|-----------------|----------------|
| Endpoints | One code-exchange endpoint per provider (`/auth/google/`, `/auth/spotify/`). |
| Session | Same shape for all providers: `accessToken`, `refreshToken`, `expiresAt`. |
| Account linking | By email; no extra “link” endpoint required. |
| Errors | 401 (or 500) with `details.code` and `details.message` for frontend messaging. |

For Google-specific implementation steps (token exchange, userinfo, redirect URI), see **backend-google-auth-implementation.md**.
