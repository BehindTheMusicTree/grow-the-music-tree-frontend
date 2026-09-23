import "server-only";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getToken, type JWT } from "next-auth/jwt";
import { z } from "zod";
import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";

declare module "next-auth" {
  interface Session {
    error?: "RefreshTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: "RefreshTokenError";
  }
}

const EXPIRY_SKEW_SECONDS = 60;
const useSecureCookies = process.env.NODE_ENV === "production";

const AuthMeSchema = z.object({ role: z.enum(["admin", "viewer", "pipeline"]) });
const GoogleRefreshSchema = z.object({
  id_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
});

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function isGrowApiAdmin(idToken: string): Promise<boolean> {
  const upstreamBase = getGrowApiUpstreamBaseUrl().replace(/\/+$/, "");
  const response = await fetch(`${upstreamBase}/auth/me/`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!response.ok) return false;
  const parsed = AuthMeSchema.safeParse(await response.json());
  return parsed.success && parsed.data.role === "admin";
}

function isExpired(token: JWT): boolean {
  return !token.expiresAt || Date.now() / 1000 >= token.expiresAt - EXPIRY_SKEW_SECONDS;
}

async function refreshIdToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) return { ...token, error: "RefreshTokenError" };
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: requireEnv("AUTH_GOOGLE_ID"),
        client_secret: requireEnv("AUTH_GOOGLE_SECRET"),
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });
    const parsed = GoogleRefreshSchema.safeParse(await response.json());
    if (!response.ok || !parsed.success) return { ...token, error: "RefreshTokenError" };
    return {
      ...token,
      idToken: parsed.data.id_token,
      expiresAt: Math.floor(Date.now() / 1000) + parsed.data.expires_in,
      refreshToken: parsed.data.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshTokenError" };
  }
}

// Lazy config so a missing env var fails the first auth request instead of `next build`.
export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  secret: requireEnv("AUTH_SECRET"),
  useSecureCookies,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: requireEnv("AUTH_GOOGLE_ID"),
      clientSecret: requireEnv("AUTH_GOOGLE_SECRET"),
      authorization: { params: { access_type: "offline", prompt: "consent", scope: "openid email profile" } },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      return !!account?.id_token && (await isGrowApiAdmin(account.id_token));
    },
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }
      if (token.error || !isExpired(token)) return token;
      return refreshIdToken(token);
    },
    session({ session, token }) {
      if (token.error) session.error = token.error;
      return session;
    },
  },
}));

/**
 * Server-only: the admin's Google ID token for forwarding to grow-api, or null when signed out.
 * The ID token lives only in the encrypted JWT cookie and is never put on the client session.
 */
export async function getAdminIdToken(request: Request): Promise<string | null> {
  const token = await getToken({ req: request, secret: requireEnv("AUTH_SECRET"), secureCookie: useSecureCookies });
  if (!token || token.error || !token.idToken) return null;
  if (!isExpired(token)) return token.idToken;
  // ponytail: the refreshed token isn't written back to the cookie here; the client's next
  // /api/auth/session fetch persists it via the jwt callback. Until then each write refreshes again.
  const refreshed = await refreshIdToken(token);
  return refreshed.error ? null : (refreshed.idToken ?? null);
}
