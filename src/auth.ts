import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";
import { isEmailVerificationEnabled } from "@/lib/config";

// Thrown when a valid password is supplied for an account that hasn't confirmed
// its email yet. The `code` is surfaced to the client via signIn({redirect:false})
// so the sign-in form can show a "verify your email" message.
class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

// Full config: adds the Prisma adapter and the JWT session strategy. Import
// this everywhere in the app except the proxy (which uses auth.config directly).
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  // Replace the edge-safe Credentials placeholder with the real bcrypt
  // validation. We recreate the provider via Credentials() rather than spreading
  // the placeholder: Credentials() nests the config under `options`, which
  // Auth.js merges *over* the top-level fields — so a spread-level `authorize`
  // would be clobbered by the placeholder's `options.authorize`. GitHub is left
  // untouched.
  providers: authConfig.providers.map((provider) =>
    typeof provider === "function" || provider.id !== "credentials"
      ? provider
      : Credentials({
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
          },
          authorize: async (credentials) => {
            const email = credentials?.email;
            const password = credentials?.password;
            if (typeof email !== "string" || typeof password !== "string") {
              return null;
            }

            const user = await prisma.user.findUnique({
              where: { email: email.toLowerCase() },
            });
            // No user, or an OAuth-only account with no password set.
            if (!user?.password) return null;

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return null;

            // Password is correct. Only enforce verification when the flag is on
            // — and only now, so the unverified hint is never shown to someone
            // who doesn't know the password. When the flag is off, backfill any
            // still-unverified account so pre-existing users aren't locked out.
            if (!user.emailVerified) {
              if (isEmailVerificationEnabled()) {
                throw new EmailNotVerifiedError();
              }
              await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() },
              });
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          },
        }),
  ),
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
