import { createElement } from "react";
import Link from "next/link";
import { Pin, Star } from "lucide-react";

import { formatShortDate } from "@/lib/utils";
import type { DashboardItem } from "@/lib/db/items";
import { typeIcon } from "@/lib/type-icons";

interface ItemRowProps {
  item: DashboardItem;
}

// A single item line used in the Pinned and Recent lists: type icon, title
// (with pin/favorite markers), description, tags, and the created date.
export function ItemRow({ item }: ItemRowProps) {
  return (
    <Link
      href={`/items/detail/${item.id}`}
      className="flex gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        {createElement(typeIcon(item.typeIcon), {
          className: "size-4",
          // Inline style: the type color is a per-type hex value from the DB,
          // so it can't be expressed as a static Tailwind class.
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

        {item.description && (
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

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
