/**
 * Workspace Settings Page — Pengaturan & Manajemen Kategori
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkspaceById } from "@/lib/queries/workspace.queries";
import { getCategoriesByWorkspace } from "@/lib/queries/category.queries";
import { WorkspaceSettingsClient } from "./workspace-settings-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const workspace = await getWorkspaceById(id);
  return { title: `Pengaturan — ${workspace?.name ?? ""}` };
}

export default async function WorkspaceSettingsPage({ params }: Props) {
  const { id } = await params;

  const [workspace, categories] = await Promise.all([
    getWorkspaceById(id),
    getCategoriesByWorkspace(id),
  ]);

  if (!workspace) notFound();

  return (
    <WorkspaceSettingsClient workspace={workspace} categories={categories} />
  );
}
