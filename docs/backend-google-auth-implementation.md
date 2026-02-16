# Backend: Google Auth Implementation

Instructions for implementing the Google OAuth 2.0 endpoint consumed by the frontend.

## Overview

The frontend redirects users to Google’s consent screen, then sends the authorization **code** to your API. The backend must exchange that code for Google tokens, create or match a user, and return the **same session shape** as Spotify auth so the client can use one session model.

## Endpoint

| Method | Path (relative to API base URL) | Auth required |
|--------|----------------------------------|---------------|
| POST   | `auth/google/`                   | No            |

## Request

**Content-Type:** `application/json`

**Body:**

```json
{
  "code": "<authorization_code_from_google_callback>"
}
```

- `code` (string, required): One-time authorization code from Google’s redirect (query param `code`). Short-lived (minutes); must be exchanged server-side.

## Response

**Success (e.g. 200):**

```json
{
  "accessToken": "<your_jwt_or_session_token>",
  "refreshToken": "<your_refresh_token>",
  "expiresAt": <unix_timestamp_milliseconds>
}
```

- `accessToken` (string): Token the client sends in `Authorization: Bearer <accessToken>` on subsequent requests.
- `refreshToken` (string): Used by the backend to renew the session when `accessToken` expires.
- `expiresAt` (number): Unix timestamp in **milliseconds** when the access token expires (for client-side expiry handling).

This shape must match the existing Spotify auth response so the frontend can store one session type.

## Backend implementation steps

### 1. Google OAuth 2.0 setup

- In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**:
  - Create an **OAuth 2.0 Client ID** (Web application).
  - Add **Authorized redirect URIs** used by the frontend (e.g. `https://your-frontend.com/auth/google/callback`, `http://localhost:3000/auth/google/callback`).
- Create a **Client ID** (web) and a **Client secret**.
- Store the **client secret** only on the backend (env var, e.g. `GOOGLE_CLIENT_SECRET`). The frontend uses only the **client ID** (e.g. `NEXT_PUBLIC_GOOGLE_CLIENT_ID`).

### 2. Exchange code for Google tokens

- Request to Google’s token endpoint:
  - URL: `POST https://oauth2.googleapis.com/token`
  - Body (e.g. `application/x-www-form-urlencoded`):
    - `code`: authorization code from the request body
    - `client_id`: your Google OAuth client ID
    - `client_secret`: your Google OAuth client secret
    - `redirect_uri`: **exact** redirect URI used in the frontend redirect (must match what the frontend sent to Google)
    - `grant_type`: `authorization_code`
- On success, Google returns:
  - `access_token`, `refresh_token` (if `access_type=offline` and first consent), `expires_in` (seconds).

### 3. Identify or create user

- Use the Google `access_token` (or the ID token from the same response) to load user identity:
  - Option A: Call Google’s userinfo endpoint: `GET https://www.googleapis.com/oauth2/v2/userinfo` with `Authorization: Bearer <google_access_token>`.
  - Option B: Decode and validate the **ID token** (JWT) from the token response (`id_token`) to get `sub` (Google user id), `email`, etc.
- In your DB, find or create a user linked to this Google id (and optionally email). If you already support Spotify, you can link both providers to the same user (e.g. by email or account id).

### 4. Issue your own session

- Create a session for that user (same as for Spotify):
  - Generate your own **access token** (e.g. JWT) and **refresh token**.
  - Compute **expiresAt** in milliseconds (e.g. `Date.now() + expiresInSeconds * 1000`).
- Optionally store the Google `refresh_token` in your DB (encrypted) so you can refresh Google tokens if needed for API calls on behalf of the user.

### 5. Return the contract

- Respond with status 200 and JSON:
  - `accessToken`: your session/JWT token
  - `refreshToken`: your refresh token
  - `expiresAt`: number (Unix ms)

### 6. Error handling

- If the `code` is missing, invalid, or expired: respond with **4xx** (e.g. 400 or 401). The frontend treats auth failures as `BACKEND_AUTH_ERROR` and shows a generic error.
- If Google returns an error during code exchange: map to an appropriate HTTP status and body; the frontend will show the same generic auth error.

## Redirect URI consistency

The `redirect_uri` sent to Google in the **code exchange** must match exactly the redirect URI used when the frontend sent the user to Google (including scheme, host, port, and path). The frontend builds it as:

- `origin + NEXT_PUBLIC_GOOGLE_REDIRECT_URI` (e.g. `https://app.example.com` + `/auth/google/callback` → `https://app.example.com/auth/google/callback`).

So the backend must use the **same** redirect URI when calling `oauth2.googleapis.com/token`, or Google will reject the exchange. You can either:

- Configure the backend with the full redirect URI(s) per environment, or
- Derive it from the frontend origin if the frontend sends it (e.g. in a header or body). The current frontend does not send it; it only sends `code`. So the backend should be configured with the same redirect URI as the frontend for each environment.

## Optional: refresh token handling

If the frontend sends your `refreshToken` to a refresh endpoint (e.g. when `accessToken` is expired), your backend can issue a new `accessToken` and `expiresAt`. Same as for Spotify: the frontend expects one session format for both providers.

## Summary checklist

- [ ] Create Google OAuth 2.0 Web client and get client ID + client secret.
- [ ] Add `POST auth/google/` that accepts `{ "code": "..." }`.
- [ ] Exchange `code` with `https://oauth2.googleapis.com/token` (client_id, client_secret, redirect_uri, grant_type=authorization_code).
- [ ] Get user identity (userinfo or ID token) and find/create user.
- [ ] Create your own session (access + refresh tokens, expiry).
- [ ] Return `{ accessToken, refreshToken, expiresAt }` with the same semantics as Spotify auth.
- [ ] Use the same redirect_uri as the frontend when calling Google.
