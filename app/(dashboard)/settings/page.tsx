/**
 * Settings Page — Server Component
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <SettingsClient user={user} />;
}
