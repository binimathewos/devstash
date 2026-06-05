import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible config: providers only, no adapter or database access.
// Safe to import in the proxy (Next.js 16 runs it on the nodejs runtime, but
// keeping this split lets the proxy stay free of the Prisma adapter).
// GitHub reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from the environment.
export default {
  providers: [GitHub],
} satisfies NextAuthConfig;
