import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/auth/UserAvatar";

export const metadata: Metadata = {
  title: "Profile — DevStash",
};

// Minimal profile page — the sidebar avatar links here. Protected by the proxy.
export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="mx-auto max-w-lg p-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to dashboard
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

      <div className="flex items-center gap-4 rounded-lg border border-border p-4">
        <UserAvatar name={user?.name} image={user?.image} size={64} />
        <div className="min-w-0">
          <p className="truncate text-lg font-medium">
            {user?.name ?? "Account"}
          </p>
          {user?.email && (
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
