/**
 * Dashboard Layout — Minimal Auth Wrapper
 * Sidebar dihandle oleh sub-layout (workspaces, settings, workspace/[id])
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
