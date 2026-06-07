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
  const [error, setError] = useState("");

  async function handleResend() {
    if (!email || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // The endpoint always succeeds to avoid account enumeration — except when
      // rate limited (429), which doesn't reveal anything about the account and
      // should be surfaced so the user knows to slow down.
      if (res.status === 429) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Too many attempts. Please try again later.");
        setStatus("idle");
        return;
      }
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
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={handleResend}
        disabled={!email || status === "sending"}
        className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Resend verification email"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
