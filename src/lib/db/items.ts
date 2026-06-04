import { prisma } from "@/lib/prisma";

// Temporary: scope queries to the seeded demo user until auth is wired up.
const DEMO_USER_EMAIL = "demo@devstash.io";

// An item shaped for the dashboard lists (Pinned / Recent). Carries its type's
// icon + color so the row can render the badge without a second lookup.
export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string; // ISO date (YYYY-MM-DD)
  typeIcon: string; // lucide icon name (from ItemType.icon)
  typeColor: string | null; // hex color (from ItemType.color)
}

// Shared Prisma selection so Pinned and Recent return the same shape.
const dashboardItemSelect = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  type: { select: { icon: true, color: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

type ItemRecord = {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  type: { icon: string | null; color: string | null };
  tags: { tag: { name: string } }[];
};

function toDashboardItem(item: ItemRecord): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags.map((t) => t.tag.name),
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt.toISOString().slice(0, 10),
    typeIcon: item.type.icon ?? "File",
    typeColor: item.type.color,
  };
}

// Pinned items for the dashboard. Returns [] when none are pinned, so the
// caller can hide the section entirely.
export async function getPinnedItems(): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { user: { email: DEMO_USER_EMAIL }, isPinned: true },
    orderBy: { createdAt: "desc" },
    select: dashboardItemSelect,
  });
  return items.map(toDashboardItem);
}

// Most recently created items for the dashboard main area.
export async function getRecentItems(limit = 10): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { user: { email: DEMO_USER_EMAIL } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: dashboardItemSelect,
  });
  return items.map(toDashboardItem);
}

// Item counts for the dashboard stats cards.
export async function getItemStats(): Promise<{
  total: number;
  favorites: number;
}> {
  const where = { user: { email: DEMO_USER_EMAIL } };
  const [total, favorites] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.count({ where: { ...where, isFavorite: true } }),
  ]);
  return { total, favorites };
}
