import {
  FolderHeart,
  FolderOpen,
  LayoutGrid,
  Star,
  type LucideIcon,
} from "lucide-react";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string; // tailwind text-color class for the icon
}

interface StatsCardsProps {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

// Four summary cards at the top of the dashboard. Not in the reference
// screenshot — added per the phase 3 spec.
export function StatsCards({
  totalItems,
  totalCollections,
  favoriteItems,
  favoriteCollections,
}: StatsCardsProps) {
  const stats: Stat[] = [
    { label: "Items", value: totalItems, icon: LayoutGrid, color: "text-blue-500" },
    { label: "Collections", value: totalCollections, icon: FolderOpen, color: "text-purple-500" },
    { label: "Favorite Items", value: favoriteItems, icon: Star, color: "text-yellow-500" },
    { label: "Favorite Collections", value: favoriteCollections, icon: FolderHeart, color: "text-pink-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
              <Icon className={stat.color} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold leading-none">{stat.value}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
