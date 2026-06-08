import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

// Wraps /items/* in the same dashboard shell (top bar + sidebar) used by
// /dashboard, since the sidebar's type/collection links point here and users
// expect to keep navigating from the sidebar while browsing a type's items.
export default async function ItemsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userId = session?.user?.id;

  const [itemTypes, collections] = await Promise.all([
    userId ? getSidebarItemTypes(userId) : Promise.resolve([]),
    userId ? getSidebarCollections(userId) : Promise.resolve([]),
  ]);

  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
    image: session?.user?.image ?? null,
  };

  return (
    <DashboardShell itemTypes={itemTypes} collections={collections} user={user}>
      {children}
    </DashboardShell>
  );
}
