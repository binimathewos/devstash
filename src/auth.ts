import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";

// Full config: adds the Prisma adapter and the JWT session strategy. Import
// this everywhere in the app except the proxy (which uses auth.config directly).
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    // Persist the user id on the token at sign-in...
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // ...and expose it on the session for the app to consume.
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
