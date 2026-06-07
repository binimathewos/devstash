import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationToken } from "@/lib/verification";
import { isEmailVerificationEnabled } from "@/lib/config";

// POST /api/auth/register — create a new email/password user.
// Body: { name, email, password, confirmPassword }
// Returns the { success, data?, error? } pattern used across the app.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { name, email, password, confirmPassword } = body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 },
      );
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 },
      );
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
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

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationRequired = isEmailVerificationEnabled();
    // When verification is required, leave emailVerified null (schema default)
    // so the user must confirm via the link before signing in. When it's
    // disabled, activate the account immediately — no email round-trip needed.
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: verificationRequired ? undefined : new Date(),
      },
    });

    // Send the verification email only when verification is required. The
    // account already exists, so a send failure shouldn't fail registration —
    // surface it via `emailSent` and let the user re-request the link from the
    // "check your email" screen.
    let emailSent = false;
    if (verificationRequired) {
      emailSent = true;
      try {
        await createAndSendVerificationToken(user.email, user.name);
      } catch (emailError) {
        emailSent = false;
        console.error("Verification email failed to send:", emailError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          verificationRequired,
          emailSent,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
