"use client";

import { useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import type { SidebarUserData } from "@/components/dashboard/SidebarUser";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

const MOBILE_QUERY = "(max-width: 767px)";

// Tracks whether we're below the md breakpoint without a setState-in-effect.
// Assumes desktop during SSR so the markup matches the common case.
function useIsMobile() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(MOBILE_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

// Owns the sidebar open/closed state shared between the top bar toggle and
// the sidebar. On desktop the sidebar collapses inline; on mobile it becomes
// an overlay drawer (always a drawer below the md breakpoint).
export function DashboardShell({
  children,
  itemTypes,
  collections,
  user,
}: Readonly<{
  children: React.ReactNode;
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  user: SidebarUserData;
}>) {
  const isMobile = useIsMobile();
  // null = follow the breakpoint default (open on desktop, closed on mobile);
  // a concrete boolean means the user has toggled it explicitly.
  const [open, setOpen] = useState<boolean | null>(null);
  const isOpen = open ?? !isMobile;
  // Desktop collapsed = icon rail; mobile closed = drawer slid off-screen.
  const collapsed = !isMobile && !isOpen;

  return (
    <div className="flex h-screen flex-col">
      <TopBar onToggleSidebar={() => setOpen(!isOpen)} />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {isMobile && isOpen && (
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-14 z-20 bg-black/50"
            aria-hidden
          />
        )}

        <aside
          className={cn(
            "z-30 shrink-0 border-r border-border bg-background",
            isMobile
              ? "fixed inset-y-0 top-14 left-0 w-64 transition-transform"
              : "static transition-[width]",
            isMobile && !isOpen && "-translate-x-full",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <Sidebar
            itemTypes={itemTypes}
            collections={collections}
            user={user}
            collapsed={collapsed}
            onNavigate={() => setOpen(false)}
          />
        </aside>

        <main className="flex-1 overflow-auto p-6">
          <ItemDrawerProvider>{children}</ItemDrawerProvider>
        </main>
      </div>
    </div>
  );
}
