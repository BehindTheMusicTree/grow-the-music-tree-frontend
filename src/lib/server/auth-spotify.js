import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { publicConfig } from "@lib/public-config";
import { serverConfig } from "@lib/server/server-config";

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: publicConfig.spotifyClientId,
      // No client secret - we'll handle token exchange in our API
      clientSecret: "placeholder-not-used", // Required by Provider but won't be used
      authorization: {
        params: {
          scope: publicConfig.spotifyScope,
          redirect_uri: publicConfig.spotifyRedirectUri,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "spotify") {
        const response = await fetch("/api/auth/spotify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: account.code,
            redirect_uri: publicConfig.spotifyRedirectUri,
          }),
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();
        // Store the token from our API
        account.access_token = data.access_token;
        account.refresh_token = data.refresh_token;
        account.expires_at = data.expires_at;
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Use server config for session secret and url but not client secret
  secret: serverConfig.authSecret,
  url: serverConfig.authUrl,
};

export default NextAuth(authOptions);