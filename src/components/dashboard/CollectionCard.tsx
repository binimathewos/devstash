import Link from "next/link";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

import type { Collection } from "@/lib/mock-data";
import { typeIcon } from "@/lib/type-icons";

// The small type-icon badges shown along the bottom of a collection card,
// representing the kinds of items it holds.
export interface TypeBadge {
  icon: string; // lucide icon name
  color: string; // tailwind text-color class
}

interface CollectionCardProps {
  collection: Collection;
  typeBadges: TypeBadge[];
}

export function CollectionCard({ collection, typeBadges }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex items-center gap-1.5 truncate font-medium">
          <span className="truncate">{collection.name}</span>
          {collection.isFavorite && (
            <Star className="size-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
          )}
        </h3>
      </div>

      <p className="mt-0.5 text-xs text-muted-foreground">
        {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
      </p>

      <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {collection.description}
      </p>

      {typeBadges.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          {typeBadges.map((badge, index) => {
            const Icon = typeIcon(badge.icon);
            return <Icon key={index} className={cn("size-4", badge.color)} />;
          })}
        </div>
      )}
    </Link>
  );
}
