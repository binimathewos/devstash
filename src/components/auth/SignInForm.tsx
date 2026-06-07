"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResendVerification } from "@/components/auth/ResendVerification";

// lucide-react v1 dropped brand icons, so inline the GitHub mark.
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.34-1.72-1.34-1.72-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.81 0-1.28.47-2.33 1.23-3.15-.12-.3-.53-1.5.12-3.13 0 0 1-.32 3.3 1.2a11.6 11.6 0 0 1 6 0c2.28-1.52 3.29-1.2 3.29-1.2.65 1.63.24 2.83.12 3.13.77.82 1.23 1.87 1.23 3.15 0 4.51-2.81 5.5-5.49 5.79.43.36.81 1.09.81 2.2 0 1.59-.01 2.87-.01 3.26 0 .32.21.69.82.57A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}

interface SignInFormProps {
  // Where to land after a successful sign-in.
  callbackUrl: string;
  // Error code passed back by NextAuth on a failed redirect-based attempt.
  initialError?: string;
  // Status from the email-verification flow: "1" (verified), "expired",
  // "invalid", or "error".
  verified?: string;
  // "1" after a successful registration when verification is disabled — the
  // account is already active, so we just confirm and prompt to sign in.
  registered?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Maps the ?verified= query param to a user-facing notice. Returns null for
// values that shouldn't show anything.
function verifiedNotice(verified?: string): string | null {
  switch (verified) {
    case "1":
      return "Email verified — you can now sign in.";
    case "expired":
      return "That verification link has expired. Sign in to get a new one sent.";
    case "invalid":
      return "That verification link is invalid or has already been used.";
    case "error":
      return "We couldn't verify your email. Please try again.";
    default:
      return null;
  }
}

export function SignInForm({
  callbackUrl,
  initialError,
  verified,
  registered,
}: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    initialError ? "Unable to sign in. Please try again." : "",
  );
  const [loading, setLoading] = useState(false);
  // True once a sign-in attempt fails specifically because the email is
  // unverified — surfaces a resend affordance.
  const [needsVerification, setNeedsVerification] = useState(false);

  const notice =
    verifiedNotice(verified) ??
    (registered === "1" ? "Account created — you can now sign in." : null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNeedsVerification(false);

    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (!result || result.error) {
      // Surfaced from the authorize() EmailNotVerifiedError — password was
      // correct, but the account hasn't been verified yet.
      if (result?.code === "email_not_verified") {
        setNeedsVerification(true);
        setError("Please verify your email before signing in.");
        return;
      }
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {notice && (
        <p
          role="status"
          className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
        >
          {notice}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => signIn("github", { callbackUrl })}
      >
        <GithubIcon className="size-4" />
        Sign in with GitHub
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {needsVerification && <ResendVerification email={email} />}

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
