/**
 * Zod Validation Schemas — Workspace
 */
import { z } from "zod";

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Nama workspace wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  icon: z.string().min(1, "Pilih icon"),
  color: z.string().min(1, "Pilih warna"),
});

export type WorkspaceSchema = z.infer<typeof workspaceSchema>;
