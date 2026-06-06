"use client";

import { useState } from "react";

interface ResendVerificationProps {
  // The email to re-send the verification link to. When empty, the button is
  // disabled (the sign-in form enables it once an email has been typed).
  email: string;
}

// Small "didn't get the email? resend" control. Calls the resend endpoint, which
// always succeeds (no account enumeration), so we show a neutral confirmation.
export function ResendVerification({ email }: ResendVerificationProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleResend() {
    if (!email || status === "sending") return;
    setStatus("sending");
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Swallow — the endpoint is best-effort and never reveals account state.
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <p className="text-sm text-muted-foreground">
        If that account needs verifying, a new link is on its way.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={!email || status === "sending"}
      className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
    >
      {status === "sending" ? "Sending…" : "Resend verification email"}
    </button>
  );
}
