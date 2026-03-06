import { z } from "zod";

export const menuSchema = z.object({
  name: z.string().min(2, "Minimal 2 karakter").max(150),
  description: z.string().max(1000).optional().or(z.literal("")),
  price: z
    .preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      },
      z.number().min(0, "Harga tidak boleh negatif"),
    )
    .refine((val) => val !== undefined, {
      message: "Harga wajib diisi",
    }),
  category: z.string().min(1, "Kategori wajib diisi"),
  is_available: z.boolean().default(true),
  stock: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }, z.number().int().min(0).nullable().optional()),
  preparation_time: z
    .preprocess((val) => {
      if (val === "" || val === null || val === undefined) return 15;
      const num = Number(val);
      return isNaN(num) ? 15 : num;
    }, z.number().int().min(1).max(120))
    .default(15),
});

export type MenuForm = z.infer<typeof menuSchema>;
