"use client";

import { createElement, useEffect, useState, type ReactNode } from "react";
import {
  Copy,
  FolderOpen,
  Info,
  Pencil,
  Pin,
  Star,
  Tag,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { cn, formatLongDate } from "@/lib/utils";
import { typeIcon } from "@/lib/type-icons";
import type { ItemDetail } from "@/lib/db/items";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; item: ItemDetail };

// Right-side detail view for an item: fetches full detail on open (card data
// is already known to the caller, but content/url/language/collection aren't),
// shows a skeleton while loading, then the header, action bar, and detail
// sections. Editing/code-editor/mutations are deferred — display only for now.
export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {/* Keyed by itemId so switching items remounts with a clean loading
            state instead of needing an explicit reset inside the effect. */}
        {itemId && <ItemDrawerLoader key={itemId} itemId={itemId} />}
      </SheetContent>
    </Sheet>
  );
}

function ItemDrawerLoader({ itemId }: { itemId: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/items/${itemId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to load item");
        return json.data as ItemDetail;
      })
      .then((item) => {
        if (!cancelled) setState({ status: "loaded", item });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  if (state.status === "loading") return <ItemDrawerSkeleton />;
  if (state.status === "error") {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Couldn&apos;t load this item. Please try again.
      </p>
    );
  }
  return <ItemDrawerDetail item={state.item} />;
}

function ItemDrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex items-center gap-3">
        <div className="size-9 shrink-0 animate-pulse rounded-md bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
      <div className="h-9 animate-pulse rounded-md bg-muted" />
      <div className="space-y-2">
        <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-28 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

function ItemDrawerDetail({ item }: { item: ItemDetail }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = item.content ?? item.url;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex flex-col gap-5 overflow-y-auto p-4">
      <SheetHeader className="gap-2 p-0">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
            {createElement(typeIcon(item.typeIcon), {
              className: "size-4",
              // Inline style: the type color is a per-type hex value from the
              // DB, so it can't be expressed as a static Tailwind class.
              style: item.typeColor ? { color: item.typeColor } : undefined,
            })}
          </div>
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate">{item.title}</SheetTitle>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="capitalize">
                {item.typeName}s
              </Badge>
              {item.language && <Badge variant="outline">{item.language}</Badge>}
            </div>
          </div>
        </div>
      </SheetHeader>

      <div className="flex items-center gap-1 border-y border-border py-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(item.isFavorite && "text-yellow-500 hover:text-yellow-500")}
        >
          <Star className={cn("size-4", item.isFavorite && "fill-yellow-500")} />
          Favorite
        </Button>
        <Button variant="ghost" size="sm">
          <Pin className={cn("size-4", item.isPinned && "fill-current")} />
          Pin
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!item.content && !item.url}>
          <Copy className="size-4" />
          {copied ? "Copied" : "Copy"}
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Edit">
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {item.description && (
        <Section label="Description">
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </Section>
      )}

      {(item.content || item.url) && (
        <Section label="Content">
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
            <code>{item.content ?? item.url}</code>
          </pre>
        </Section>
      )}

      {item.tags.length > 0 && (
        <Section label="Tags" icon={Tag}>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </Section>
      )}

      {item.collection && (
        <Section label="Collections" icon={FolderOpen}>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {item.collection.name}
          </span>
        </Section>
      )}

      <Section label="Details" icon={Info}>
        <div className="grid grid-cols-2 gap-y-1.5 text-sm">
          <span className="text-muted-foreground">Created</span>
          <span className="text-right">{formatLongDate(item.createdAt)}</span>
          <span className="text-muted-foreground">Updated</span>
          <span className="text-right">{formatLongDate(item.updatedAt)}</span>
        </div>
      </Section>
    </div>
  );
}

function Section({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </div>
      {children}
    </div>
  );
}
