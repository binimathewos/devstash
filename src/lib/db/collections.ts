import { prisma } from "@/lib/prisma";

// Temporary: scope queries to the seeded demo user until auth is wired up.
const DEMO_USER_EMAIL = "demo@devstash.io";

// A small type-icon badge shown along the bottom of a collection card.
export interface CollectionTypeBadge {
  icon: string; // lucide icon name
  color: string; // hex color (from ItemType.color)
}

// A collection shaped for the dashboard grid: item count, an accent color
// derived from its most-used item type, and the distinct types it contains.
export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  accentColor: string | null; // hex of the most-used item type
  typeBadges: CollectionTypeBadge[];
}

// Recent collections for the dashboard main area. Each item carries only its
// type's icon/color so we can compute the accent color + badges in memory.
export async function getDashboardCollections(
  limit = 6,
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { user: { email: DEMO_USER_EMAIL } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      _count: { select: { items: true } },
      items: {
        select: { type: { select: { id: true, icon: true, color: true } } },
      },
    },
  });

  return collections.map((collection) => {
    // Tally items per type: the most-used type drives the accent color, and
    // every distinct type becomes an icon badge.
    const counts = new Map<
      string,
      { count: number; icon: string | null; color: string | null }
    >();
    for (const { type } of collection.items) {
      const entry = counts.get(type.id);
      if (entry) entry.count += 1;
      else counts.set(type.id, { count: 1, icon: type.icon, color: type.color });
    }

    const byCount = [...counts.values()].sort((a, b) => b.count - a.count);
    const accentColor = byCount[0]?.color ?? null;
    const typeBadges: CollectionTypeBadge[] = byCount
      .filter((t): t is typeof t & { icon: string } => Boolean(t.icon))
      .map((t) => ({ icon: t.icon, color: t.color ?? "currentColor" }));

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      itemCount: collection._count.items,
      accentColor,
      typeBadges,
    };
  });
}

// A collection shaped for the sidebar list: item count plus an accent color
// derived from its most-used item type (rendered as a colored dot for recents).
export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  itemCount: number;
  accentColor: string | null; // hex of the most-used item type
}

// All of the user's collections for the sidebar, newest first. Each carries an
// accent color (most-used item type) so recents can show a colored dot.
export async function getSidebarCollections(): Promise<SidebarCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { user: { email: DEMO_USER_EMAIL } },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
      items: { select: { type: { select: { id: true, color: true } } } },
    },
  });

  return collections.map((collection) => {
    // The most-used type's color drives the accent dot.
    const counts = new Map<string, { count: number; color: string | null }>();
    for (const { type } of collection.items) {
      const entry = counts.get(type.id);
      if (entry) entry.count += 1;
      else counts.set(type.id, { count: 1, color: type.color });
    }
    const accentColor =
      [...counts.values()].sort((a, b) => b.count - a.count)[0]?.color ?? null;

    return {
      id: collection.id,
      name: collection.name,
      isFavorite: collection.isFavorite,
      itemCount: collection._count.items,
      accentColor,
    };
  });
}

// Collection counts for the dashboard stats cards.
export async function getCollectionStats(): Promise<{
  total: number;
  favorites: number;
}> {
  const where = { user: { email: DEMO_USER_EMAIL } };
  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where }),
    prisma.collection.count({ where: { ...where, isFavorite: true } }),
  ]);
  return { total, favorites };
}
