/**
 * Server Actions — Auth
 * Login, logout, dan manajemen session
 */
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Login dengan email & password
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email atau password salah. Silakan coba lagi." };
  }

  revalidatePath("/", "layout");
  redirect("/workspaces");
}

/**
 * Logout user
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Dapatkan user yang sedang login
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Update profil user
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const name = formData.get("name") as string;

  const { error } = await supabase
    .from("users")
    .update({ name })
    .eq("id", user.id);

  if (error) return { error: "Gagal memperbarui profil" };

  revalidatePath("/settings");
  return { data: { success: true } };
}

/**
 * Update password
 */
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { error: "Password tidak cocok" };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: "Gagal memperbarui password" };

  return { data: { success: true } };
}
