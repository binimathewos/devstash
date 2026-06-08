"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { ItemDrawer } from "@/components/items/ItemDrawer";

interface ItemDrawerContextValue {
  openItem: (itemId: string) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

// Owns the drawer's open/selected-item state and renders the drawer itself,
// so item lists (rendered by server components on the dashboard and
// /items/[type] pages) can open it via context without owning any state
// themselves — they just need to be client components to call useItemDrawer.
export function ItemDrawerProvider({ children }: { children: ReactNode }) {
  const [itemId, setItemId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function openItem(id: string) {
    setItemId(id);
    setOpen(true);
  }

  return (
    <ItemDrawerContext.Provider value={{ openItem }}>
      {children}
      <ItemDrawer itemId={itemId} open={open} onOpenChange={setOpen} />
    </ItemDrawerContext.Provider>
  );
}

export function useItemDrawer() {
  const context = useContext(ItemDrawerContext);
  if (!context) {
    throw new Error("useItemDrawer must be used within an ItemDrawerProvider");
  }
  return context;
}
