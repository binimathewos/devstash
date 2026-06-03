import { createElement } from "react";
import Link from "next/link";
import { Pin, Star } from "lucide-react";

import { cn, formatShortDate } from "@/lib/utils";
import type { Item, ItemType } from "@/lib/mock-data";
import { typeIcon } from "@/lib/type-icons";

interface ItemRowProps {
  item: Item;
  type: ItemType | undefined;
}

// A single item line used in the Pinned and Recent lists: type icon, title
// (with pin/favorite markers), description, tags, and the created date.
export function ItemRow({ item, type }: ItemRowProps) {
  return (
    <Link
      href={`/items/detail/${item.id}`}
      className="flex gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        {createElement(typeIcon(type?.icon ?? "File"), {
          className: cn("size-4", type?.color),
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

        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
          {item.description}
        </p>

        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
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
      </div>

      <span className="shrink-0 text-xs text-muted-foreground">
        {formatShortDate(item.createdAt)}
      </span>
    </Link>
  );
}
