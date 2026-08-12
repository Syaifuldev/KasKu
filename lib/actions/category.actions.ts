/**
 * Server Actions — Category
 * CRUD untuk kategori transaksi per workspace
 */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { categorySchema } from "@/lib/validations/category.schema";

/**
 * Tambah kategori baru
 */
export async function createCategory(workspaceId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const raw = {
    name: (formData.get("name") as string)?.trim(),
    color: formData.get("color") as string,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  // Verifikasi workspace milik user
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!workspace) return { error: "Workspace tidak ditemukan" };

  const { data, error } = await supabase
    .from("categories")
    .insert({
      workspace_id: workspaceId,
      name: parsed.data.name,
      color: parsed.data.color,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Nama kategori sudah ada" };
    return { error: "Gagal menambah kategori" };
  }

  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath(`/workspace/${workspaceId}/settings`);
  revalidatePath(`/workspace/${workspaceId}/transactions`);
  return { data };
}

/**
 * Update kategori
 */
export async function updateCategory(
  id: string,
  workspaceId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const raw = {
    name: (formData.get("name") as string)?.trim(),
    color: formData.get("color") as string,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      color: parsed.data.color,
    })
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) {
    if (error.code === "23505") return { error: "Nama kategori sudah ada" };
    return { error: "Gagal memperbarui kategori" };
  }

  revalidatePath(`/workspace/${workspaceId}/settings`);
  revalidatePath(`/workspace/${workspaceId}/transactions`);
  return { data: { success: true } };
}

/**
 * Hapus kategori
 */
export async function deleteCategory(id: string, workspaceId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { error: "Gagal menghapus kategori" };

  revalidatePath(`/workspace/${workspaceId}/settings`);
  revalidatePath(`/workspace/${workspaceId}/transactions`);
  return { data: { success: true } };
}
