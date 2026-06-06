import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In — DevStash",
};

// Custom sign-in page (wired as NextAuth's pages.signIn). Reads callbackUrl /
// error from the query string and hands them to the client form.
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    verified?: string;
  }>;
}) {
  const { callbackUrl, error, verified } = await searchParams;

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your DevStash account">
      <SignInForm
        callbackUrl={callbackUrl || "/dashboard"}
        initialError={error}
        verified={verified}
      />
    </AuthCard>
  );
}
