import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

// Dashboard shell: top bar + collapsible sidebar / main split.
// Sidebar open state and the responsive drawer live in DashboardShell.
// Sidebar data (item types + collections) is read live from the DB here and
// passed down, since DashboardShell/Sidebar are client components.
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [itemTypes, collections] = await Promise.all([
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  return (
    <DashboardShell itemTypes={itemTypes} collections={collections}>
      {children}
    </DashboardShell>
  );
}
