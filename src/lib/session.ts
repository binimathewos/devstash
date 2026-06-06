import { redirect } from "next/navigation";

import { auth } from "@/auth";

// Returns the signed-in user's id for server components/actions behind the auth
// proxy. Redirects to sign-in if there's no session (defense-in-depth — the
// proxy already guards these routes).
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  return session.user.id;
}
