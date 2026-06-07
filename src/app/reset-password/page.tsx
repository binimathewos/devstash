import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { checkPasswordResetToken } from "@/lib/verification";

export const metadata: Metadata = {
  title: "Reset Password — DevStash",
};

// Validate the token on the server before rendering the form, so an invalid or
// expired link shows a clear message instead of a dead-end form.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token ?? "";
  const check = await checkPasswordResetToken(token || null);

  if (check.status !== "valid") {
    const message =
      check.status === "expired"
        ? "This reset link has expired."
        : "This reset link is invalid or has already been used.";

    return (
      <AuthCard
        title="Reset password"
        subtitle="Set a new password for your account"
      >
        <div className="flex flex-col gap-4 text-center">
          <p
            role="alert"
            className="rounded-md border border-border bg-muted/50 px-3 py-3 text-sm text-muted-foreground"
          >
            {message}
          </p>
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Request a new link
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="Set a new password for your account"
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
