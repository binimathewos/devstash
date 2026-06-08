"use client";

import { createElement } from "react";
import { Pin, Star } from "lucide-react";

import { formatShortDate } from "@/lib/utils";
import type { DashboardItem } from "@/lib/db/items";
import { typeIcon } from "@/lib/type-icons";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";

interface ItemCardProps {
  item: DashboardItem;
}

// A grid card for the /items/[type] list view: type icon, title (with
// pin/favorite markers), description, tags, and the created date. Mirrors
// ItemRow's left-border accent + icon coloring, laid out as a card instead
// of a row. Clicking opens the item drawer rather than navigating.
export function ItemCard({ item }: ItemCardProps) {
  const { openItem } = useItemDrawer();

  return (
    <button
      type="button"
      onClick={() => openItem(item.id)}
      className="flex flex-col gap-3 rounded-lg border border-l-2 border-border bg-card p-4 text-left transition-colors hover:border-ring"
      // Inline style: the type color is a per-type hex value from the DB, so
      // it can't be expressed as a static Tailwind class.
      style={item.typeColor ? { borderLeftColor: item.typeColor } : undefined}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
          {createElement(typeIcon(item.typeIcon), {
            className: "size-4",
            // Inline style: the type color is a per-type hex value from the
            // DB, so it can't be expressed as a static Tailwind class.
            style: item.typeColor ? { color: item.typeColor } : undefined,
          })}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium">{item.title}</span>
            {item.isPinned && (
              <Pin className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            {item.isFavorite && (
              <Star className="size-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatShortDate(item.createdAt)}
          </span>
        </div>
      </div>

      {item.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
      )}

      {item.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
