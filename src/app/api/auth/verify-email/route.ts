import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/email";
import { verifyEmailToken } from "@/lib/verification";

// GET /api/auth/verify-email?token=... — consume an email-verification link.
// Maps the result to a redirect back to the sign-in page with a status query
// param the UI renders as a message.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  let verified = "error";
  try {
    const result = await verifyEmailToken(token);
    switch (result.status) {
      case "verified":
      case "already_verified":
        verified = "1";
        break;
      case "expired":
        verified = "expired";
        break;
      case "invalid":
        verified = "invalid";
        break;
    }
  } catch (error) {
    console.error("Email verification failed:", error);
  }

  return NextResponse.redirect(
    new URL(`/sign-in?verified=${verified}`, getBaseUrl()),
  );
}
