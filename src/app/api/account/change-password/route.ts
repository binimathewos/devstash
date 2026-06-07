import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/account/change-password — change the signed-in user's password.
// Body: { currentPassword, newPassword, confirmPassword }
// Only works for email/password accounts (those with a password set); GitHub
// OAuth-only accounts have no password to change.
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const { currentPassword, newPassword, confirmPassword } = body ?? {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 },
      );
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New passwords do not match." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    // No password set means this is an OAuth-only account — nothing to change.
    if (!user?.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Password change isn't available for this account.",
        },
        { status: 400 },
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Your current password is incorrect." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
