import type { DefaultSession } from "next-auth";

// Add the user id to the session and JWT so the app can read session.user.id.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
