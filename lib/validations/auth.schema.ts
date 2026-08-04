import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email tidak boleh kosong").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter").max(50, "Nama maksimal 50 karakter"),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export const passwordSchema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirm_password: z.string().min(1, "Konfirmasi password tidak boleh kosong"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Password tidak cocok",
  path: ["confirm_password"],
});

export type PasswordSchema = z.infer<typeof passwordSchema>;
