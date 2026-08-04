/**
 * Server Actions — Workspace
 * CRUD workspace
 */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { workspaceSchema } from "@/lib/validations/workspace.schema";

/**
 * Buat workspace baru
 */
export async function createWorkspace(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    icon: formData.get("icon") as string,
    color: formData.get("color") as string,
  };

  const parsed = workspaceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      icon: parsed.data.icon,
      color: parsed.data.color,
    })
    .select()
    .single();

  if (error) return { error: "Gagal membuat workspace" };

  revalidatePath("/workspaces");
  return { data };
}

/**
 * Update workspace
 */
export async function updateWorkspace(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    icon: formData.get("icon") as string,
    color: formData.get("color") as string,
  };

  const parsed = workspaceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { error } = await supabase
    .from("workspaces")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      icon: parsed.data.icon,
      color: parsed.data.color,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Gagal memperbarui workspace" };

  revalidatePath("/workspaces");
  revalidatePath(`/workspace/${id}`);
  return { data: { success: true } };
}

/**
 * Arsipkan / aktifkan workspace
 */
export async function toggleArchiveWorkspace(id: string, isArchived: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("workspaces")
    .update({ is_archived: !isArchived })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Gagal mengarsipkan workspace" };

  revalidatePath("/workspaces");
  return { data: { success: true } };
}

/**
 * Hapus workspace
 */
export async function deleteWorkspace(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Gagal menghapus workspace" };

  revalidatePath("/workspaces");
  return { data: { success: true } };
}
