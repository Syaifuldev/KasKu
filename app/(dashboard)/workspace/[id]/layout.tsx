/**
 * Workspace Layout
 * Menyuntikkan workspaceId ke sidebar dan mobile nav
 */
import { notFound, redirect } from "next/navigation";
import { getWorkspaceById } from "@/lib/queries/workspace.queries";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

interface Props {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const { id } = await params;

  const [user, workspace] = await Promise.all([
    getCurrentUser(),
    getWorkspaceById(id),
  ]);

  if (!user) redirect("/login");
  if (!workspace) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar dengan workspaceId */}
      <Sidebar user={user} workspaceId={id} />

      {/* Mobile nav dengan workspaceName */}
      <MobileNav
        user={user}
        workspaceId={id}
        workspaceName={workspace.name}
      />

      {/* Main content */}
      <main className="main-content min-h-screen">
        <div className="pt-14 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}
