import NextAuth from "next-auth";
import { authOptions } from "@lib/server/auth-spotify";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
