import { Boxes, PanelLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  // Toggles the sidebar open/closed (and the mobile drawer).
  onToggleSidebar?: () => void;
}

// Search and the action buttons are still display only (wired up in later phases).
export function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border px-4">
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <PanelLeft className="size-4" />
        </button>
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Boxes className="size-4" />
        </div>
        <span className="text-base font-semibold">DevStash</span>
      </div>

      <div className="relative w-full max-w-xl justify-self-center">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          className="pl-9"
          aria-label="Search items"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 justify-self-end">
        <Button variant="outline">New Collection</Button>
        <Button>New Item</Button>
      </div>
    </header>
  );
}
