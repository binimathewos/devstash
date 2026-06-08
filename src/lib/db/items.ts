import { prisma } from "@/lib/prisma";

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
export async function getPinnedItems(userId: string): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: dashboardItemSelect,
  });
  return items.map(toDashboardItem);
}

// Most recently created items for the dashboard main area.
export async function getRecentItems(
  userId: string,
  limit = 10,
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: dashboardItemSelect,
  });
  return items.map(toDashboardItem);
}

// Info about an item type, for rendering the /items/[type] page header.
export interface ItemTypeInfo {
  id: string;
  name: string; // raw type name from the DB (e.g. "snippet")
  icon: string; // lucide icon name
  color: string | null; // hex color (from ItemType.color)
}

// The user's items of a single system type (matched by raw DB name, e.g.
// "snippet"), newest first. Returns null when the type doesn't exist so the
// caller can 404.
export async function getItemsByType(
  userId: string,
  typeName: string,
): Promise<{ type: ItemTypeInfo; items: DashboardItem[] } | null> {
  const type = await prisma.itemType.findFirst({
    where: { name: typeName, isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
  });
  if (!type) return null;

  const items = await prisma.item.findMany({
    where: { userId, typeId: type.id },
    orderBy: { createdAt: "desc" },
    select: dashboardItemSelect,
  });

  return {
    type: { id: type.id, name: type.name, icon: type.icon ?? "File", color: type.color },
    items: items.map(toDashboardItem),
  };
}

// A system item type shaped for the sidebar: its icon/color plus how many of
// the current user's items use it.
export interface SidebarItemType {
  id: string;
  name: string; // raw type name from the DB (e.g. "snippet")
  icon: string; // lucide icon name
  color: string | null; // hex color (from ItemType.color)
  count: number; // number of the user's items of this type
}

// Fixed display order for the system item types in the sidebar (the DB has no
// ordering column). Names not listed here fall to the end, alphabetically.
const SYSTEM_TYPE_ORDER = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
];

// System item types for the sidebar, each with the user's item count. All
// system types are returned (even with a zero count) so the list is stable.
export async function getSidebarItemTypes(
  userId: string,
): Promise<SidebarItemType[]> {
  const [types, counts] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: { id: true, name: true, icon: true, color: true },
    }),
    prisma.item.groupBy({
      by: ["typeId"],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  const countByType = new Map(counts.map((c) => [c.typeId, c._count._all]));

  const orderOf = (name: string) => {
    const index = SYSTEM_TYPE_ORDER.indexOf(name);
    return index === -1 ? SYSTEM_TYPE_ORDER.length : index;
  };

  return types
    .sort((a, b) => orderOf(a.name) - orderOf(b.name) || a.name.localeCompare(b.name))
    .map((type) => ({
      id: type.id,
      name: type.name,
      icon: type.icon ?? "File",
      color: type.color,
      count: countByType.get(type.id) ?? 0,
    }));
}

// Item counts for the dashboard stats cards.
export async function getItemStats(userId: string): Promise<{
  total: number;
  favorites: number;
}> {
  const [total, favorites] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);
  return { total, favorites };
}
