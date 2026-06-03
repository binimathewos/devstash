import Link from "next/link";
import { Pin } from "lucide-react";

import { collections, items, itemTypes } from "@/lib/mock-data";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard, type TypeBadge } from "@/components/dashboard/CollectionCard";
import { ItemRow } from "@/components/dashboard/ItemRow";

const typeById = new Map(itemTypes.map((type) => [type.id, type]));

// Distinct item-type badges for the items belonging to a collection,
// shown along the bottom of each collection card.
function typeBadgesFor(collectionId: string): TypeBadge[] {
  const seen = new Set<string>();
  const badges: TypeBadge[] = [];
  for (const item of items) {
    if (item.collectionId !== collectionId || seen.has(item.typeId)) continue;
    seen.add(item.typeId);
    const type = typeById.get(item.typeId);
    if (type) badges.push({ icon: type.icon, color: type.color });
  }
  return badges;
}

export default function DashboardPage() {
  const pinnedItems = items.filter((item) => item.isPinned);
  const recentItems = [...items]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your developer knowledge hub
        </p>
      </div>

      <StatsCards
        totalItems={items.length}
        totalCollections={collections.length}
        favoriteItems={items.filter((item) => item.isFavorite).length}
        favoriteCollections={collections.filter((c) => c.isFavorite).length}
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Collections</h2>
          <Link
            href="/collections"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              typeBadges={typeBadgesFor(collection.id)}
            />
          ))}
        </div>
      </section>

      {pinnedItems.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Pin className="size-4 text-muted-foreground" />
            Pinned
          </h2>
          <div className="flex flex-col gap-3">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} type={typeById.get(item.typeId)} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Items</h2>
        <div className="flex flex-col gap-3">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} type={typeById.get(item.typeId)} />
          ))}
        </div>
      </section>
    </div>
  );
}
