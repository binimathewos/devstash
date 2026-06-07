import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationToken } from "@/lib/verification";
import { checkRateLimit, getClientIp, rateLimitedResponse } from "@/lib/rate-limit";

// POST /api/auth/resend-verification — re-send a verification link.
// Body: { email }. Always returns success regardless of whether the account
// exists or is already verified, to avoid leaking which emails are registered.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = body?.email;

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(
      "resend-verification",
      3,
      "15 m",
      `${ip}:${normalizedEmail}`,
    );
    if (!rateLimit.success) {
      const { error, status, headers } = rateLimitedResponse(rateLimit.reset);
      return NextResponse.json({ success: false, error }, { status, headers });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Only actually send when there's an unverified, password-based account.
    if (user?.password && !user.emailVerified) {
      await createAndSendVerificationToken(user.email, user.name);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
