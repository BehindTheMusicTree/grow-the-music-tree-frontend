# Frontend authentication

Everyone browses anonymously and read-only. A single admin (the owner) signs in with Google to get
write access. There are no user accounts beyond that.

## Flow

1. The admin opens the hidden `/admin` page (linked from nowhere) and clicks **Sign in with Google**.
2. [Auth.js v5](https://authjs.dev) (`next-auth@5`, config in [`src/lib/auth.ts`](../src/lib/auth.ts),
   handlers at `src/app/api/auth/[...nextauth]/route.ts`) runs the Google OAuth flow with
   `access_type=offline` and `prompt=consent`, so Google returns a refresh token.
3. The `signIn` callback calls grow-api `GET auth/me/` with `Authorization: Bearer <id_token>`. The
   sign-in is accepted only if the API answers `200 {"role": "admin"}`. Any other account is
   rejected, so a session always means admin.
4. The session is a JWT (session strategy `jwt`) stored in an encrypted httpOnly cookie. It holds the
   Google `id_token`, `refresh_token` and `expires_at`.

## Token handling

- The ID token never reaches the browser. The client session (`useSession()`, `/api/auth/session`)
  only carries the Google profile and an optional `error`. Server code reads the ID token with
  `getAdminIdToken()` in `src/lib/auth.ts`.
- Google ID tokens live for one hour. The `jwt` callback refreshes them through
  `POST https://oauth2.googleapis.com/token` (`grant_type=refresh_token`) once they are within 60s of
  expiry, keeping the old refresh token if Google doesn't return a new one. If the refresh fails,
  the session gets `error: "RefreshTokenError"` and counts as signed out.

## Grow-api proxy

`src/app/api/grow-proxy/[...path]/route.ts` forwards browser requests to grow-api:

- `GET`/`HEAD`: forwarded anonymously, or with the admin's Bearer token when signed in.
- Any other method without an admin session: answered with `401` directly, without calling
  grow-api, in the API's error shape:
  `{"code": 401, "message": "...", "success": false, "details": {"message": "...", "code": "authentication_required"}}`.
- With an admin session: forwarded with `Authorization: Bearer <id_token>`.

grow-api verifies the ID token independently. Its errors: `401` with `details.code`
`authentication_required` or `invalid_token`, and `403` with `permission_denied`.

## UI

`useIsAdmin()` (`src/hooks/useIsAdmin.ts`) is true only for a signed-in session without an error.
Write controls are hidden (not disabled) otherwise. Today that's the genre tree's add root, load
example tree, add child, rename and reparent controls, all gated by `GenreTreeView`'s `readOnly` prop.

## Setup

1. In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services, configure the
   OAuth consent screen, then create an OAuth client ID of type **Web application**.
2. Add each origin's callback under **Authorized redirect URIs**:
   `http://localhost:3000/api/auth/callback/google` (use your dev port), plus
   `https://<staging host>/api/auth/callback/google` and `https://<prod host>/api/auth/callback/google`.
3. Set these server-only env vars (runtime, not build args):

| Variable | Value |
|----------|-------|
| `AUTH_SECRET` | Random secret that encrypts the session cookie (`npx auth secret`) |
| `AUTH_GOOGLE_ID` | OAuth client ID |
| `AUTH_GOOGLE_SECRET` | OAuth client secret |
| `AUTH_TRUST_HOST` | `true` behind a reverse proxy (Coolify), so Auth.js trusts the forwarded host |

The same client ID must be configured on grow-api (`GOOGLE_OAUTH_CLIENT_ID`) so it accepts the
token's audience, and the admin's Google `sub` must be set there as `ADMIN_GOOGLE_SUB`.

Missing `AUTH_SECRET`, `AUTH_GOOGLE_ID` or `AUTH_GOOGLE_SECRET` makes the first auth or proxy request throw.
