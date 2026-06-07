import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { resetPasswordWithToken } from "@/lib/verification";

// POST /api/auth/reset-password — set a new password using a reset token.
// Body: { token, password, confirmPassword }
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { token, password, confirmPassword } = body ?? {};

    if (
      typeof token !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 },
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await resetPasswordWithToken(token, hashedPassword);

    if (result.status === "expired") {
      return NextResponse.json(
        {
          success: false,
          error: "This reset link has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    if (result.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: "This reset link is invalid or has already been used.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
