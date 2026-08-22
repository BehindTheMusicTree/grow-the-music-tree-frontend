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

# next.config.js's REQUIRED_ENV_VARS check runs at `next build` time, so every NEXT_PUBLIC_* var it
# needs must be passed as a build arg here, or the build fails with "Missing required environment
# variable(s)". Coolify injects these via its buildtime_env config (see infrastructure repo).
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_SPOTIFY_CLIENT_ID
ARG NEXT_PUBLIC_SPOTIFY_SCOPES
ARG NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_REDIRECT_URI
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ARG NEXT_PUBLIC_SENTRY_IS_ACTIVE
ARG NEXT_PUBLIC_SPOTIFY_AUTH_URL
ENV NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL \
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID=$NEXT_PUBLIC_SPOTIFY_CLIENT_ID \
    NEXT_PUBLIC_SPOTIFY_SCOPES=$NEXT_PUBLIC_SPOTIFY_SCOPES \
    NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=$NEXT_PUBLIC_SPOTIFY_REDIRECT_URI \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_GOOGLE_REDIRECT_URI=$NEXT_PUBLIC_GOOGLE_REDIRECT_URI \
    NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL \
    NEXT_PUBLIC_SENTRY_IS_ACTIVE=$NEXT_PUBLIC_SENTRY_IS_ACTIVE \
    NEXT_PUBLIC_SPOTIFY_AUTH_URL=$NEXT_PUBLIC_SPOTIFY_AUTH_URL

COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static/
COPY --from=builder --chown=nextjs:nodejs /app/public ./public/
ENV PORT=3000
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
