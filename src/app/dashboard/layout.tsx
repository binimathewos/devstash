import { DashboardShell } from "@/components/dashboard/DashboardShell";

// Dashboard shell: top bar + collapsible sidebar / main split.
// Sidebar open state and the responsive drawer live in DashboardShell.
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell>{children}</DashboardShell>;
}
