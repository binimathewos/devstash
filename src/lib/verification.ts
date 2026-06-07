import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import {
  getBaseUrl,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email";

// Verification links are single-use and expire after 24 hours.
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// Password-reset links are single-use and short-lived (1 hour).
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

// Reset tokens reuse the VerificationToken model, so we namespace their
// `identifier` (otherwise plain lowercased email) to keep them from colliding
// with email-verification tokens. `reset:<email>` means deleteMany clears only
// reset tokens, and we can tell the two flows apart by inspecting the prefix.
const RESET_IDENTIFIER_PREFIX = "reset:";

function resetIdentifier(email: string): string {
  return `${RESET_IDENTIFIER_PREFIX}${email.toLowerCase()}`;
}

// Create (or refresh) an email-verification token for the given email and email
// the user a link to it. Any prior tokens for the same email are cleared first
// so only the latest link is valid. `identifier` stores the lowercased email.
export async function createAndSendVerificationToken(
  email: string,
  name: string | null,
) {
  const identifier = email.toLowerCase();
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  const verifyUrl = `${getBaseUrl()}/api/auth/verify-email?token=${token}`;
  await sendVerificationEmail({ to: identifier, name, verifyUrl });
}

type VerifyResult =
  | { status: "verified" }
  | { status: "already_verified" }
  | { status: "invalid" }
  | { status: "expired" };

// Consume a verification token: validate it, mark the user verified, and delete
// the token (single-use). Returns a discriminated status for the caller to map
// to a redirect/message.
export async function verifyEmailToken(
  token: string | null,
): Promise<VerifyResult> {
  if (!token) return { status: "invalid" };

  const record = await prisma.verificationToken.findFirst({
    where: { token },
  });
  if (!record) return { status: "invalid" };

  // Expired — clean it up and report.
  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier, token },
    });
    return { status: "expired" };
  }

  const user = await prisma.user.findUnique({
    where: { email: record.identifier },
  });
  if (!user) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier, token },
    });
    return { status: "invalid" };
  }

  if (user.emailVerified) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier, token },
    });
    return { status: "already_verified" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({
    where: { identifier: record.identifier, token },
  });

  return { status: "verified" };
}

// Create (or refresh) a password-reset token for the given email and email the
// user a link to the reset page. Any prior reset tokens for the same email are
// cleared first so only the latest link is valid. Caller must have confirmed
// the account exists and has a password.
export async function createAndSendPasswordResetToken(
  email: string,
  name: string | null,
) {
  const identifier = resetIdentifier(email);
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
  await sendPasswordResetEmail({ to: email.toLowerCase(), name, resetUrl });
}

type ResetCheck =
  | { status: "valid"; email: string }
  | { status: "invalid" }
  | { status: "expired" };

// Read-only validation of a reset token (used on the reset page load). Confirms
// the token exists, is a reset token (not a verification token), hasn't expired,
// and maps to a real password-based account. Does NOT consume the token.
export async function checkPasswordResetToken(
  token: string | null,
): Promise<ResetCheck> {
  if (!token) return { status: "invalid" };

  const record = await prisma.verificationToken.findFirst({ where: { token } });
  if (!record || !record.identifier.startsWith(RESET_IDENTIFIER_PREFIX)) {
    return { status: "invalid" };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    });
    return { status: "expired" };
  }

  const email = record.identifier.slice(RESET_IDENTIFIER_PREFIX.length);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.password) return { status: "invalid" };

  return { status: "valid", email };
}

type ResetResult =
  | { status: "success" }
  | { status: "invalid" }
  | { status: "expired" };

// Consume a reset token and set the user's new (already-hashed) password.
// Single-use: the token is deleted once the password is updated.
export async function resetPasswordWithToken(
  token: string | null,
  hashedPassword: string,
): Promise<ResetResult> {
  const check = await checkPasswordResetToken(token);
  if (check.status !== "valid") return check;

  await prisma.user.update({
    where: { email: check.email },
    data: { password: hashedPassword },
  });
  await prisma.verificationToken.deleteMany({
    where: { identifier: resetIdentifier(check.email) },
  });

  return { status: "success" };
}
