import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { getBaseUrl, sendVerificationEmail } from "@/lib/email";

// Verification links are single-use and expire after 24 hours.
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

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
