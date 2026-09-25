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

### 1. Google Cloud Console

Do every step in [Google Cloud Console](https://console.cloud.google.com/), signed in with the account
that should own the app. Field names are the ones the console shows under **Google Auth Platform**
(the menu that replaced "APIs & Services → OAuth consent screen" in 2025). If a project, screen or
client below already exists, edit it to match instead of creating a new one.

Hosts used below (from the `infrastructure` repo's GitHub variables: `DOMAIN_NAME=themusictree.org`,
`GTMT_FRONT_SUBDOMAIN=grow`, `GTMT_API_SUBDOMAIN=grow-api`, and a `-staging` suffix for staging):

| Environment | grow front origin                       | grow-api host                               |
| ----------- | --------------------------------------- | ------------------------------------------- |
| dev         | `http://localhost:3000`–`3009`          | `http://127.0.0.1:8000` (local grow-api)    |
| staging     | `https://grow-staging.themusictree.org` | `https://grow-api-staging.themusictree.org` |
| production  | `https://grow.themusictree.org`         | `https://grow-api.themusictree.org`         |

#### 1.1 Project

Top bar → project picker → **New project**.

| Field        | Value                                     |
| ------------ | ----------------------------------------- |
| Project name | `Grow The Music Tree`                     |
| Organization | your organization, or **No organization** |
| Location     | same as Organization                      |

Click **Create**, then select the new project in the project picker. Every following step happens in
this project. One project serves all three environments, which share one consent screen.

No API has to be enabled. Sign-in and token refresh only use Google's OAuth endpoints.

#### 1.2 Consent screen: Get started

Menu → **Google Auth Platform** → **Overview** → **Get started**. The wizard has four steps.

**App Information**

| Field              | Value                                                               |
| ------------------ | ------------------------------------------------------------------- |
| App name           | `Grow The Music Tree`: the admin sees it on Google's account picker |
| User support email | the org contact email (GitHub org variable `CONTACT_EMAIL`)         |

**Audience**

| Field    | Value                                                                             |
| -------- | --------------------------------------------------------------------------------- |
| Audience | **External**: lets a personal Google account sign in (Internal is Workspace-only) |

**Contact Information**

| Field           | Value                                                              |
| --------------- | ------------------------------------------------------------------ |
| Email addresses | the org contact email. Google sends notices about the project here |

**Finish**: tick **I agree to the Google API Services: User Data Policy** → **Continue** → **Create**.

#### 1.3 Branding

Menu → **Google Auth Platform** → **Branding**. The wizard filled in App name and User support email.
Set the rest:

| Field                             | Value                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------ |
| App logo                          | leave empty. A logo triggers Google's brand verification (days to weeks)       |
| Application home page             | `https://grow.themusictree.org`                                                |
| Application privacy policy link   | leave empty while in Testing. Required before publishing (1.5)                 |
| Application terms of service link | leave empty (optional)                                                         |
| Authorized domains                | `themusictree.org`: covers `grow` and `grow-staging`. localhost needs no entry |
| Developer contact information     | the org contact email                                                          |

Click **Save**.

#### 1.4 Data access (scopes)

Menu → **Google Auth Platform** → **Data access** → **Add or remove scopes**. Tick these three,
then **Update** → **Save**:

| Scope                       | Why                                                             |
| --------------------------- | --------------------------------------------------------------- |
| `openid`                    | the ID token itself (`sub`, checked against `ADMIN_GOOGLE_SUB`) |
| `.../auth/userinfo.email`   | `email` in the token, returned by grow-api `auth/me/`           |
| `.../auth/userinfo.profile` | name and picture for the session (`useSession()`)               |

These match `scope: "openid email profile"` in `src/lib/auth.ts`. All three are non-sensitive, so
Google doesn't need to review them. The refresh token comes from `access_type=offline`, not from a
scope. Don't add anything else: any sensitive or restricted scope forces verification.

#### 1.5 Audience (testing vs production)

Menu → **Google Auth Platform** → **Audience**.

| Setting           | Value                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------- |
| Publishing status | **Testing**. Only test users can sign in, which fits a single-admin site               |
| Test users        | **Add users** → the admin's Google account (the one whose `sub` is `ADMIN_GOOGLE_SUB`) |

In Testing, Google expires refresh tokens after 7 days: the session then gets `RefreshTokenError`
and the admin signs in again. To lift that limit: add the privacy policy link (1.3), then
**Publish app** → **Confirm**. With only the three scopes above, no verification review is needed.
Sign-in stays admin-only either way, because the `signIn` callback rejects every non-admin account.

#### 1.6 OAuth clients (one per environment)

Menu → **Google Auth Platform** → **Clients** → **Create client**. Do this three times, once per column.

| Field                         | Dev                                                                                                                                                                        | Staging                                                          | Production                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| Application type              | **Web application**                                                                                                                                                        | **Web application**                                              | **Web application**                                      |
| Name (console-only label)     | `gtmt-front dev`                                                                                                                                                           | `gtmt-front staging`                                             | `gtmt-front production`                                  |
| Authorized JavaScript origins | _(none)_                                                                                                                                                                   | _(none)_                                                         | _(none)_                                                 |
| Authorized redirect URIs      | `http://localhost:3000/api/auth/callback/google`<br>`http://localhost:3001/api/auth/callback/google`<br>…<br>`http://localhost:3009/api/auth/callback/google` (10 entries) | `https://grow-staging.themusictree.org/api/auth/callback/google` | `https://grow.themusictree.org/api/auth/callback/google` |

Click **Create** on each. The dialog shows the **Client ID** (`<numbers>-<hash>.apps.googleusercontent.com`)
and the **Client secret**. Copy both right away: the secret is only shown in full once (you can add a
new one later from the client's page).

Notes on redirect URIs:

- Each URI must match exactly what Auth.js sends: scheme, host, port and path, no trailing slash.
  Auth.js builds it from the request host, so open the dev server as `http://localhost:<port>`, not
  `http://127.0.0.1:<port>`, or Google answers `redirect_uri_mismatch`.
- Dev: Google allows no wildcards or port ranges, so the dev client registers the fixed block
  `http://localhost:3000` to `http://localhost:3009`, one entry per port. `pnpm dev` uses 3000; start
  another worktree on the next free port with `pnpm dev -p 3001` (up to 3009). Any other port fails
  with `redirect_uri_mismatch`.
- Staging PR previews (`*.grow-staging.themusictree.org`) can't sign in: wildcard hosts can't be
  registered. Browse them anonymously, or add a preview's exact callback URI to the staging client
  while testing it.
- JavaScript origins stay empty because the OAuth flow runs server-side (redirect and code
  exchange), never through Google's JavaScript library.
- Changes take effect after a few minutes, sometimes longer.

#### 1.7 Where each client ID and secret goes

Each environment's client is shared by grow front (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) and
grow-api (`GOOGLE_OAUTH_CLIENT_ID`, the ID token audience), so the two always agree.

| Client     | Put the Client ID and secret in                                                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dev        | `.env.local` → `AUTH_GOOGLE_ID=…`, `AUTH_GOOGLE_SECRET=…`, `NEXT_PUBLIC_GROW_BACKEND_BASE_URL=http://127.0.0.1:8000/v1/`; local grow-api → `GOOGLE_OAUTH_CLIENT_ID=…` (same ID) and `ADMIN_GOOGLE_SUB` (see its README) |
| staging    | `infrastructure` repo → Settings → Secrets and variables → Actions → **secrets** `GROW_GOOGLE_OAUTH_CLIENT_ID_STAGING`, `GROW_GOOGLE_OAUTH_CLIENT_SECRET_STAGING`                                                       |
| production | same place → **secrets** `GROW_GOOGLE_OAUTH_CLIENT_ID_PROD`, `GROW_GOOGLE_OAUTH_CLIENT_SECRET_PROD`                                                                                                                     |

The admin's `sub` for staging and production is the `infrastructure` secret `GROW_ADMIN_GOOGLE_SUB`.

Or from a terminal:

```bash
gh secret set GROW_GOOGLE_OAUTH_CLIENT_ID_STAGING     -R BehindTheMusicTree/infrastructure --body '<staging client id>'
gh secret set GROW_GOOGLE_OAUTH_CLIENT_SECRET_STAGING -R BehindTheMusicTree/infrastructure --body '<staging client secret>'
gh secret set GROW_GOOGLE_OAUTH_CLIENT_ID_PROD        -R BehindTheMusicTree/infrastructure --body '<production client id>'
gh secret set GROW_GOOGLE_OAUTH_CLIENT_SECRET_PROD    -R BehindTheMusicTree/infrastructure --body '<production client secret>'
```

Then apply the infrastructure coolify role and redeploy `gtmt-front` and `gtmt-api`.

Dev sign-in needs a local grow-api. The committed `.env` points at staging grow-api, which only
accepts ID tokens whose audience is the staging client, so it rejects a dev-client token and the
`signIn` callback refuses the sign-in. Anonymous browsing against staging works with any client.

### 2. Environment variables

Server-only, read at runtime (not build args):

| Variable             | Value                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| `AUTH_SECRET`        | Random secret that encrypts the session cookie (`npx auth secret`)            |
| `AUTH_GOOGLE_ID`     | OAuth client ID (1.7)                                                         |
| `AUTH_GOOGLE_SECRET` | OAuth client secret (1.7)                                                     |
| `AUTH_TRUST_HOST`    | `true` behind a reverse proxy (Coolify), so Auth.js trusts the forwarded host |

Locally, put them in `.env.local` (see `.env.example`). Missing `AUTH_SECRET`, `AUTH_GOOGLE_ID` or `AUTH_GOOGLE_SECRET` stops the server at boot (`src/lib/env.server.ts`).

### 3. Troubleshooting

| Symptom                                                               | Cause and fix                                                                                                                                                                                                  |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Error 400: redirect_uri_mismatch`                                    | The callback URI isn't on the client (1.6): wrong port, `127.0.0.1` instead of `localhost`, a PR preview host, or a change that hasn't propagated yet                                                          |
| `Access blocked: … has not completed the Google verification process` | The account isn't a test user (1.5)                                                                                                                                                                            |
| Google account picker succeeds, then Auth.js shows `AccessDenied`     | grow-api's `auth/me/` didn't answer `{"role": "admin"}`: the client ID differs from grow-api's `GOOGLE_OAUTH_CLIENT_ID` (dev client against staging grow-api), or the account's `sub` isn't `ADMIN_GOOGLE_SUB` |
| Signed out after about a week                                         | Testing-mode refresh tokens expire after 7 days (1.5). Sign in again, or publish the app                                                                                                                       |
