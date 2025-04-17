import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      // No client secret - we'll handle token exchange in our API
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET, // Required by Provider but won't be used
      authorization: {
        params: {
          scope: process.env.SPOTIFY_SCOPE,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
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
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
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
    signIn: "/api/auth/spotify",
  },
  secret: process.env.NEXTAUTH_SECRET,
  url: process.env.NEXT_PUBLIC_BASE_URL_WITHOUT_PORT,
};

export default NextAuth(authOptions);
