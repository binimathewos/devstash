import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { UserAvatar } from "@/components/auth/UserAvatar";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccount } from "@/components/profile/DeleteAccount";
import { getProfileUser } from "@/lib/db/users";
import { getItemStats, getSidebarItemTypes } from "@/lib/db/items";
import { getCollectionStats } from "@/lib/db/collections";
import { requireUserId } from "@/lib/session";
import { typeIcon } from "@/lib/type-icons";
import { formatLongDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profile — DevStash",
};

// Per-request render: the page reflects the user's live counts and account info.
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const userId = await requireUserId();

  const [user, itemStats, collectionStats, typeBreakdown] = await Promise.all([
    getProfileUser(userId),
    getItemStats(userId),
    getCollectionStats(userId),
    getSidebarItemTypes(userId),
  ]);

  // Session JWT outlived the user row (e.g. just-deleted account).
  if (!user) redirect("/sign-in");

  const createdAt = formatLongDate(user.createdAt.toISOString().slice(0, 10));

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to dashboard
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

      {/* User info */}
      <section className="flex items-center gap-4 rounded-lg border border-border p-4">
        <UserAvatar name={user.name} image={user.image} size={64} />
        <div className="min-w-0">
          <p className="truncate text-lg font-medium">
            {user.name ?? "Account"}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {user.email}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Member since {createdAt}
          </p>
        </div>
      </section>

      {/* Usage stats */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Usage
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-2xl font-semibold">{itemStats.total}</p>
            <p className="text-sm text-muted-foreground">
              {itemStats.total === 1 ? "Item" : "Items"}
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-2xl font-semibold">{collectionStats.total}</p>
            <p className="text-sm text-muted-foreground">
              {collectionStats.total === 1 ? "Collection" : "Collections"}
            </p>
          </div>
        </div>

        {/* Breakdown by item type */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {typeBreakdown.map((type) => {
            const Icon = typeIcon(type.icon);
            return (
              <div
                key={type.id}
                className="flex items-center gap-2.5 rounded-lg border border-border p-3"
              >
                <Icon
                  className="size-4 shrink-0"
                  style={{ color: type.color ?? undefined }}
                />
                <span className="flex-1 text-sm capitalize">{type.name}</span>
                <span className="text-sm font-medium tabular-nums">
                  {type.count}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Account actions */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Account
        </h2>

        {user.hasPassword && (
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-1 text-sm font-medium">Change password</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Update the password you use to sign in.
            </p>
            <ChangePasswordForm />
          </div>
        )}

        <div className="mt-3 rounded-lg border border-destructive/30 p-4">
          <h3 className="mb-1 text-sm font-medium text-destructive">
            Delete account
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Permanently delete your account and all of your items, collections,
            and tags. This cannot be undone.
          </p>
          <DeleteAccount />
        </div>
      </section>
    </div>
  );
}
