/**
 * Workspaces Layout — dengan Sidebar umum (tanpa workspace context)
 */
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />
      <MobileNav user={user} />
      <main className="lg:ml-60 min-h-screen">
        <div className="pt-14 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}
