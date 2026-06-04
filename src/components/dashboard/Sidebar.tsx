"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Settings, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mock-data";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";
import { typeIcon, typeSlug } from "@/lib/type-icons";
import { Badge } from "@/components/ui/badge";

// Item types gated behind the Pro plan (file uploads).
const PRO_TYPES = new Set(["file", "image"]);

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// DB type names are singular and lowercase ("snippet"); show them capitalized.
function typeLabel(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// Collapsible top-level section with a chevron header (Types, Collections).
function Section({ title, children }: SectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="px-3 py-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-2 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={cn("size-4 transition-transform", !open && "-rotate-90")}
        />
      </button>
      {open && <div className="mt-1 flex flex-col gap-0.5">{children}</div>}
    </div>
  );
}

interface SidebarProps {
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  // Icon-only rail mode (desktop collapsed state).
  collapsed?: boolean;
  // Called whenever a link is followed, so the mobile drawer can close.
  onNavigate?: () => void;
}

export function Sidebar({
  itemTypes,
  collections,
  collapsed = false,
  onNavigate,
}: SidebarProps) {
  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = collections.filter((c) => !c.isFavorite);

  if (collapsed) {
    return (
      <div className="flex h-full flex-col">
        <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-3">
          {itemTypes.map((type) => {
            const Icon = typeIcon(type.icon);
            return (
              <Link
                key={type.id}
                href={`/items/${typeSlug(type.name)}`}
                onClick={onNavigate}
                title={typeLabel(type.name)}
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
              >
                <Icon
                  className="size-4"
                  style={type.color ? { color: type.color } : undefined}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-2 border-t border-border py-3">
          <div
            className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium"
            title={currentUser.name}
          >
            {initials(currentUser.name)}
          </div>
          <button
            type="button"
            aria-label="Settings"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 overflow-y-auto py-2">
        <Section title="Types">
          {itemTypes.map((type) => {
            const Icon = typeIcon(type.icon);
            return (
              <Link
                key={type.id}
                href={`/items/${typeSlug(type.name)}`}
                onClick={onNavigate}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <Icon
                  className="size-4"
                  style={type.color ? { color: type.color } : undefined}
                />
                <span className="flex-1 truncate">{typeLabel(type.name)}</span>
                {PRO_TYPES.has(type.name) && (
                  <Badge
                    variant="outline"
                    className="h-4 px-1.5 text-[9px] font-semibold tracking-wider text-muted-foreground"
                  >
                    PRO
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {type.count}
                </span>
              </Link>
            );
          })}
        </Section>

        <Section title="Collections">
          {favoriteCollections.length > 0 && (
            <>
              <p className="px-2 pt-1 pb-0.5 text-[10px] font-medium tracking-wide text-muted-foreground/70 uppercase">
                Favorites
              </p>
              {favoriteCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  onClick={onNavigate}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <Star className="size-4 fill-yellow-500 text-yellow-500" />
                  <span className="flex-1 truncate">{collection.name}</span>
                </Link>
              ))}
            </>
          )}

          {recentCollections.length > 0 && (
            <>
              <p className="px-2 pt-2 pb-0.5 text-[10px] font-medium tracking-wide text-muted-foreground/70 uppercase">
                Recent
              </p>
              {recentCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  onClick={onNavigate}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  {/* Colored dot = the collection's most-used item type. */}
                  <span
                    className="size-2.5 shrink-0 rounded-full bg-muted-foreground/40"
                    style={
                      collection.accentColor
                        ? { backgroundColor: collection.accentColor }
                        : undefined
                    }
                  />
                  <span className="flex-1 truncate">{collection.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {collection.itemCount}
                  </span>
                </Link>
              ))}
            </>
          )}

          <Link
            href="/collections"
            onClick={onNavigate}
            className="mt-1 flex items-center rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            View all collections
          </Link>
        </Section>
      </nav>

      <div className="flex items-center gap-3 border-t border-border p-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {initials(currentUser.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{currentUser.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {currentUser.email}
          </p>
        </div>
        <button
          type="button"
          aria-label="Settings"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </div>
  );
}
