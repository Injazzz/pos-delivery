import { z } from "zod";

export const storeUserSchema = z.object({
  name: z.string().min(2, "Minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Harus mengandung huruf")
    .regex(/[0-9]/, "Harus mengandung angka"),
  role: z
    .enum(["manager", "kasir", "kurir", "pelanggan"])
    .refine((val) => val !== undefined, {
      message: "Role wajib dipilih",
    }),
  phone: z.string().min(10, "No HP tidak valid").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).catch("active"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Minimal 2 karakter").optional(),
  email: z.string().email("Email tidak valid").optional(),
  password: z
    .string()
    .min(8, "Minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Harus mengandung huruf")
    .regex(/[0-9]/, "Harus mengandung angka")
    .optional()
    .or(z.literal("")),
  role: z.enum(["manager", "kasir", "kurir", "pelanggan"]).optional(),
  phone: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Minimal 8 karakter"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
  });

export type StoreUserForm = z.infer<typeof storeUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
