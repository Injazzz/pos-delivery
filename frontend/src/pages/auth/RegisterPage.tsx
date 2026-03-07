/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
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
import apiClient from "@/lib/axios";

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

  useEffect(() => {
    const getCsrfCookie = async () => {
      try {
        await apiClient.get("/sanctum/csrf-cookie");
        console.log("CSRF cookie set");
      } catch (error) {
        console.error("Failed to get CSRF cookie", error);
      }
    };

    getCsrfCookie();
  }, []);

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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30">
            <UtensilsCrossed className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            POS Delivery
          </h1>
          <p className="text-slate-400 text-sm">Buat akun pelanggan baru</p>
        </div>

        <Card className="bg-slate-900 border-slate-800 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">Daftar</CardTitle>
            <CardDescription className="text-slate-400">
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
                  <Label htmlFor={field.id} className="text-slate-300">
                    {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
                    {...register(field.id as keyof RegisterForm)}
                  />
                  {errors[field.id as keyof RegisterForm] && (
                    <p className="text-red-400 text-xs">
                      {errors[field.id as keyof RegisterForm]?.message}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
              </Button>

              <p className="text-slate-400 text-sm text-center">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="text-amber-500 hover:text-amber-400 font-medium"
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
