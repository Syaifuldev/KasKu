/**
 * Zod Validation Schemas — Transaction (Zod v4 compatible)
 */
import { z } from "zod";

export const transactionSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  type: z.enum(["income", "expense"]).refine((v) => !!v, {
    message: "Jenis transaksi wajib dipilih",
  }),
  amount: z
    .number({ error: "Nominal harus berupa angka" })
    .positive("Nominal harus lebih dari 0")
    .max(999_999_999_999, "Nominal terlalu besar"),
  description: z
    .string()
    .min(1, "Keterangan wajib diisi")
    .max(500, "Keterangan maksimal 500 karakter"),
  category_id: z.string().optional().nullable(),
  receipt_url: z.string().optional().nullable(),
});

export type TransactionSchema = z.infer<typeof transactionSchema>;
