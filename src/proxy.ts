import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

// Build a NextAuth instance from the edge-safe config only (no Prisma adapter).
const { auth } = NextAuth(authConfig);

// Protect /dashboard/* — redirect unauthenticated users to the custom sign-in
// page, preserving where they were headed via callbackUrl.
export const proxy = auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set(
      "callbackUrl",
      req.nextUrl.pathname + req.nextUrl.search,
    );
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
