# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    --mount=type=secret,id=GH_PACKAGES_TOKEN_READ \
    if [ ! -s /run/secrets/GH_PACKAGES_TOKEN_READ ]; then \
        echo "ERROR: GH_PACKAGES_TOKEN_READ build secret is not provided" >&2; \
        exit 1; \
    fi && \
    NPM_TOKEN="$(cat /run/secrets/GH_PACKAGES_TOKEN_READ)" pnpm install --frozen-lockfile

# src/lib/env.ts is imported by next.config.ts, so its schema is validated at `next build` time:
# every NEXT_PUBLIC_* var baked into the client bundle must be passed as a build arg here, or the
# build fails. Coolify injects these via its buildtime_env config (see infrastructure repo).
# Server-only vars (src/lib/env.server.ts) are runtime env, validated at boot by src/instrumentation.ts.
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_AUDIOMETA_URL
ARG NEXT_PUBLIC_SENTRY_IS_ACTIVE
ENV NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL \
    NEXT_PUBLIC_AUDIOMETA_URL=$NEXT_PUBLIC_AUDIOMETA_URL \
    NEXT_PUBLIC_SENTRY_IS_ACTIVE=$NEXT_PUBLIC_SENTRY_IS_ACTIVE

COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
# Coolify's post-deploy healthcheck runs curl/wget inside the container; alpine ships neither
# reliably (no curl at all), so without this the healthcheck always fails and Coolify rolls back.
# Retry to ride out transient Alpine mirror/TLS blips, which otherwise fail the whole build.
RUN apk add --no-cache curl || (sleep 2 && apk add --no-cache curl) || (sleep 5 && apk add --no-cache curl)
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static/
COPY --from=builder --chown=nextjs:nodejs /app/public ./public/
ENV PORT=3000
# Docker auto-sets $HOSTNAME to the container ID; without this override, Next's standalone
# server binds there instead of all interfaces, so Coolify's localhost healthcheck can't connect.
ENV HOSTNAME=0.0.0.0
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
