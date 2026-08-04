/**
 * Server Actions — Transaction
 * CRUD transaksi dan upload receipt
 */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { transactionSchema } from "@/lib/validations/transaction.schema";

/**
 * Tambah transaksi baru
 */
export async function createTransaction(workspaceId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const raw = {
    date: formData.get("date") as string,
    type: formData.get("type") as string,
    amount: Number(formData.get("amount")),
    description: formData.get("description") as string,
    receipt_url: formData.get("receipt_url") as string | null,
  };

  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  // Verifikasi workspace milik user ini
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!workspace) return { error: "Workspace tidak ditemukan" };

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      workspace_id: workspaceId,
      date: parsed.data.date,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      receipt_url: parsed.data.receipt_url || null,
    })
    .select()
    .single();

  if (error) return { error: "Gagal menambah transaksi" };

  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath(`/workspace/${workspaceId}/transactions`);
  return { data };
}

/**
 * Update transaksi
 */
export async function updateTransaction(
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
    date: formData.get("date") as string,
    type: formData.get("type") as string,
    amount: Number(formData.get("amount")),
    description: formData.get("description") as string,
    receipt_url: formData.get("receipt_url") as string | null,
  };

  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      date: parsed.data.date,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      receipt_url: parsed.data.receipt_url || null,
    })
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { error: "Gagal memperbarui transaksi" };

  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath(`/workspace/${workspaceId}/transactions`);
  return { data: { success: true } };
}

/**
 * Hapus transaksi
 */
export async function deleteTransaction(id: string, workspaceId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return { error: "Gagal menghapus transaksi" };

  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath(`/workspace/${workspaceId}/transactions`);
  return { data: { success: true } };
}

/**
 * Upload bukti transaksi ke Supabase Storage
 */
export async function uploadReceipt(
  file: File,
  userId: string,
  workspaceId: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient();

  const ext = file.name.split(".").pop();
  const filename = `${userId}/${workspaceId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("receipts")
    .upload(filename, file, { upsert: false });

  if (error) return { url: null, error: "Gagal mengupload file" };

  const { data: { publicUrl } } = supabase.storage
    .from("receipts")
    .getPublicUrl(filename);

  return { url: publicUrl, error: null };
}
