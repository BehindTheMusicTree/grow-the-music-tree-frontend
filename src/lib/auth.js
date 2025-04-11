import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: {
          scope: process.env.NEXT_PUBLIC_SPOTIFY_SCOPE,
          redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
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
            redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
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
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
