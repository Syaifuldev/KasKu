/**
 * Zod Validation Schemas — Category
 */
import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Nama kategori wajib diisi")
    .max(50, "Nama kategori maksimal 50 karakter"),
  color: z.string().min(1, "Pilih warna kategori"),
});

export type CategorySchema = z.infer<typeof categorySchema>;
