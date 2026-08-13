/**
 * Server Actions — Workspace
 * CRUD workspace + logo upload
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

/**
 * Upload logo workspace ke Supabase Storage
 * Path: workspace-logos/{userId}/{workspaceId}/logo.{ext}
 */
export async function uploadWorkspaceLogo(
  workspaceId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const file = formData.get("logo") as File | null;
  if (!file) return { error: "File tidak ditemukan" };

  // Validasi ukuran (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Ukuran file maksimal 2MB" };
  }

  // Validasi tipe
  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Format file harus PNG, JPG, WEBP, atau GIF" };
  }

  // Tentukan ekstensi
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const storagePath = `${user.id}/${workspaceId}/logo.${ext}`;

  // Upload ke storage (upsert agar replace logo lama)
  const { error: uploadError } = await supabase.storage
    .from("workspace-logos")
    .upload(storagePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) return { error: "Gagal mengupload logo" };

  // Ambil public URL
  const { data: urlData } = supabase.storage
    .from("workspace-logos")
    .getPublicUrl(storagePath);

  const publicUrl = urlData.publicUrl;

  // Simpan URL ke tabel workspaces
  const { error: dbError } = await supabase
    .from("workspaces")
    .update({ logo_url: publicUrl })
    .eq("id", workspaceId)
    .eq("user_id", user.id);

  if (dbError) return { error: "Gagal menyimpan URL logo" };

  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath(`/workspace/${workspaceId}/settings`);
  revalidatePath(`/workspace/${workspaceId}/report`);

  return { data: { logo_url: publicUrl } };
}

/**
 * Hapus logo workspace dari storage dan DB
 */
export async function deleteWorkspaceLogo(workspaceId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  // Cari logo_url saat ini
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("logo_url")
    .eq("id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (workspace?.logo_url) {
    // Ekstrak path dari URL
    // URL format: .../storage/v1/object/public/workspace-logos/{path}
    const urlParts = workspace.logo_url.split("/workspace-logos/");
    if (urlParts[1]) {
      await supabase.storage
        .from("workspace-logos")
        .remove([decodeURIComponent(urlParts[1])]);
    }
  }

  // Set logo_url = null di DB
  const { error: dbError } = await supabase
    .from("workspaces")
    .update({ logo_url: null })
    .eq("id", workspaceId)
    .eq("user_id", user.id);

  if (dbError) return { error: "Gagal menghapus logo" };

  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath(`/workspace/${workspaceId}/settings`);
  revalidatePath(`/workspace/${workspaceId}/report`);

  return { data: { success: true } };
}
