import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible config: providers only, no adapter or database access.
// Safe to import in the proxy (Next.js 16 runs it on the nodejs runtime, but
// keeping this split lets the proxy stay free of the Prisma adapter).
// GitHub reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from the environment.
//
// The Credentials provider here is a placeholder: it declares the email/password
// form fields (so the default sign-in page renders them) but its `authorize`
// always returns null. The real bcrypt validation is provided in auth.ts, which
// overrides this provider's `authorize` — bcrypt/Prisma must stay out of the
// edge-safe config.
export default {
  // Custom auth pages (replaces NextAuth's default sign-in UI). Both the full
  // auth instance and the proxy read this, so an unauthenticated visit to a
  // protected route lands on /sign-in.
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
