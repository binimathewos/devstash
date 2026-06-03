import Link from "next/link";
import { Star } from "lucide-react";

import type { DashboardCollection } from "@/lib/db/collections";
import { typeIcon } from "@/lib/type-icons";

interface CollectionCardProps {
  collection: DashboardCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const { name, description, isFavorite, itemCount, accentColor, typeBadges } =
    collection;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex flex-col rounded-lg border border-l-2 border-border bg-card p-4 transition-colors hover:border-ring"
      // Inline style: the accent color is a per-type hex value from the DB, so
      // it can't be expressed as a static Tailwind class.
      style={accentColor ? { borderLeftColor: accentColor } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex items-center gap-1.5 truncate font-medium">
          <span className="truncate">{name}</span>
          {isFavorite && (
            <Star className="size-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
          )}
        </h3>
      </div>

      <p className="mt-0.5 text-xs text-muted-foreground">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

      {description && (
        <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {typeBadges.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          {typeBadges.map((badge, index) => {
            const Icon = typeIcon(badge.icon);
            return (
              <Icon
                key={index}
                className="size-4"
                style={{ color: badge.color }}
              />
            );
          })}
        </div>
      )}
    </Link>
  );
}
