/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import type { ApiError } from "@/types/auth";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    phone: z.string().min(10, "No HP tidak valid").optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[a-zA-Z]/, "Harus mengandung huruf")
      .regex(/[0-9]/, "Harus mengandung angka"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      const { user, token } = res.data.data;

      setAuth(user, token);
      toast.success("Registrasi berhasil! Selamat datang.");
      navigate("/menu", { replace: true });
    } catch (err: any) {
      const apiErr: ApiError = err.response?.data;
      if (apiErr?.errors) {
        Object.entries(apiErr.errors).forEach(([field, messages]) => {
          setError(field as keyof RegisterForm, { message: messages[0] });
        });
      } else {
        toast.error(apiErr?.message ?? "Registrasi gagal. Coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            POS Delivery
          </h1>
          <p className="text-muted-foreground text-sm">
            Buat akun pelanggan baru
          </p>
        </div>

        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground text-lg">Daftar</CardTitle>
            <CardDescription className="text-muted-foreground">
              Isi data diri Anda untuk membuat akun
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {[
                {
                  id: "name",
                  label: "Nama Lengkap",
                  type: "text",
                  placeholder: "John Doe",
                },
                {
                  id: "email",
                  label: "Email",
                  type: "email",
                  placeholder: "email@contoh.com",
                },
                {
                  id: "phone",
                  label: "No HP (opsional)",
                  type: "tel",
                  placeholder: "081234567890",
                },
                {
                  id: "password",
                  label: "Password",
                  type: "password",
                  placeholder: "••••••••",
                },
                {
                  id: "password_confirmation",
                  label: "Konfirmasi Password",
                  type: "password",
                  placeholder: "••••••••",
                },
              ].map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label htmlFor={field.id} className="text-foreground">
                    {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    {...register(field.id as keyof RegisterForm)}
                  />
                  {errors[field.id as keyof RegisterForm] && (
                    <p className="text-destructive text-xs">
                      {errors[field.id as keyof RegisterForm]?.message}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 mt-5">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
              </Button>

              <p className="text-muted-foreground text-sm text-center">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/90 font-medium"
                >
                  Masuk
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
