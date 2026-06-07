import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendPasswordResetToken } from "@/lib/verification";
import { checkRateLimit, getClientIp, rateLimitedResponse } from "@/lib/rate-limit";

// POST /api/auth/forgot-password — request a password-reset link.
// Body: { email }. Always returns success regardless of whether the account
// exists or is password-based, to avoid leaking which emails are registered.
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit("forgot-password", 3, "1 h", ip);
    if (!rateLimit.success) {
      const { error, status, headers } = rateLimitedResponse(rateLimit.reset);
      return NextResponse.json({ success: false, error }, { status, headers });
    }

    const body = await request.json().catch(() => null);
    const email = body?.email;

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Only send when there's a password-based account. OAuth-only accounts have
    // no password to reset. A send failure is best-effort and never surfaced —
    // the response is identical regardless, to avoid account enumeration.
    if (user?.password) {
      try {
        await createAndSendPasswordResetToken(user.email, user.name);
      } catch (emailError) {
        console.error("Password reset email failed to send:", emailError);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
