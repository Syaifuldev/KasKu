/**
 * Workspaces Page — Daftar semua workspace
 */
import type { Metadata } from "next";
import { WorkspacesClient } from "./workspaces-client";
import { getWorkspacesWithStats } from "@/lib/queries/workspace.queries";

export const metadata: Metadata = {
  title: "Workspace",
};

export default async function WorkspacesPage() {
  const workspaces = await getWorkspacesWithStats();

  return <WorkspacesClient initialWorkspaces={workspaces} />;
}
