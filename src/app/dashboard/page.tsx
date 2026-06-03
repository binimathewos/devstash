import Link from "next/link";
import { Pin } from "lucide-react";

import { items, itemTypes } from "@/lib/mock-data";
import {
  getCollectionStats,
  getDashboardCollections,
} from "@/lib/db/collections";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemRow } from "@/components/dashboard/ItemRow";

const typeById = new Map(itemTypes.map((type) => [type.id, type]));

// Data is read live from the DB, so render per-request instead of being
// statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [collections, collectionStats] = await Promise.all([
    getDashboardCollections(),
    getCollectionStats(),
  ]);

  // Items remain on mock data for now — wired to the DB in a later feature.
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
        totalCollections={collectionStats.total}
        favoriteItems={items.filter((item) => item.isFavorite).length}
        favoriteCollections={collectionStats.favorites}
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
            <CollectionCard key={collection.id} collection={collection} />
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
