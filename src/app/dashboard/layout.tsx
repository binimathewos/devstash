import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

// Dashboard shell: top bar + collapsible sidebar / main split.
// Sidebar open state and the responsive drawer live in DashboardShell.
// Sidebar data (item types + collections) is read live from the DB here and
// passed down, since DashboardShell/Sidebar are client components. The session
// user (name/email/image) feeds the sidebar avatar + sign-out menu.
export default async function DashboardLayout({
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
