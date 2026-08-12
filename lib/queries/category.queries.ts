/**
 * Category Queries
 * Query untuk mengambil kategori per workspace
 */
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

/**
 * Ambil semua kategori dalam workspace (diurutkan berdasarkan nama)
 */
export async function getCategoriesByWorkspace(
  workspaceId: string
): Promise<Category[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  return data ?? [];
}
