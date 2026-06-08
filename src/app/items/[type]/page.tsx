import { createElement } from "react";
import { notFound } from "next/navigation";

import { getItemsByType } from "@/lib/db/items";
import { requireUserId } from "@/lib/session";
import { ItemCard } from "@/components/items/ItemCard";
import { typeIcon } from "@/lib/type-icons";

// Data is read live from the DB, so render per-request instead of being
// statically prerendered at build time.
export const dynamic = "force-dynamic";

interface ItemsByTypePageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsByTypePage({
  params,
}: ItemsByTypePageProps) {
  const { type: typeName } = await params;
  const userId = await requireUserId();

  const result = await getItemsByType(userId, typeName);
  if (!result) {
    notFound();
  }

  const { type, items } = result;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          {createElement(typeIcon(type.icon), {
            className: "size-5",
            style: type.color ? { color: type.color } : undefined,
          })}
        </div>
        <div>
          <h1 className="text-2xl font-bold capitalize">{type.name}s</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No items of this type yet.
        </p>
      )}
    </div>
  );
}
