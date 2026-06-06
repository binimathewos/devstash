"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronUp, LogOut, User as UserIcon } from "lucide-react";

import { UserAvatar } from "@/components/auth/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SidebarUserData {
  name: string | null;
  email: string | null;
  image: string | null;
}

interface SidebarUserProps {
  user: SidebarUserData;
  collapsed?: boolean;
}

// The dropdown menu body (Profile link + Sign out), shared by both layouts.
function UserMenu() {
  return (
    <DropdownMenuContent side="top" align="start" className="w-48">
      <DropdownMenuItem render={<Link href="/profile" />}>
        <UserIcon className="size-4" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
      >
        <LogOut className="size-4" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

// Bottom-of-sidebar user area. Avatar shows the GitHub image or initials.
// Collapsed rail: avatar is the dropdown trigger. Expanded: avatar links to
// /profile and a chevron button opens the dropdown.
export function SidebarUser({ user, collapsed = false }: SidebarUserProps) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 border-t border-border py-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account menu"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <UserAvatar name={user.name} image={user.image} size={36} />
          </DropdownMenuTrigger>
          <UserMenu />
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 border-t border-border p-3">
      <Link
        href="/profile"
        aria-label="Go to profile"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <UserAvatar name={user.name} image={user.image} size={36} />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name ?? "Account"}</p>
        {user.email && (
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Account menu"
          className="rounded-md p-1.5 text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronUp className="size-4" />
        </DropdownMenuTrigger>
        <UserMenu />
      </DropdownMenu>
    </div>
  );
}
