/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ ...data, device: "web" });
      const { user, token } = res.data.data;

      setAuth(user, token);
      toast.success(`Selamat datang, ${user.name}!`);

      // Redirect ke halaman sebelumnya atau dashboard sesuai role
      if (from) {
        navigate(from, { replace: true });
      } else {
        const map: Record<string, string> = {
          manager: "/manager/dashboard",
          kasir: "/cashier/dashboard",
          kurir: "/courier/deliveries",
          pelanggan: "/menu",
        };
        navigate(map[user.role] ?? "/", { replace: true });
      }
    } catch (err: any) {
      const apiErr: ApiError = err.response?.data;
      if (apiErr?.errors) {
        Object.entries(apiErr.errors).forEach(([field, messages]) => {
          setError(field as keyof LoginForm, { message: messages[0] });
        });
      } else {
        toast.error(apiErr?.message ?? "Login gagal. Coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30">
            <UtensilsCrossed className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            POS Delivery
          </h1>
          <p className="text-slate-400 text-sm">Masuk ke akun Anda</p>
        </div>

        <Card className="bg-slate-900 border-slate-800 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">Masuk</CardTitle>
            <CardDescription className="text-slate-400">
              Gunakan email dan password yang terdaftar
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  autoComplete="email"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-400 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-all"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>

              <p className="text-slate-400 text-sm text-center">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="text-amber-500 hover:text-amber-400 font-medium"
                >
                  Daftar sekarang
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
