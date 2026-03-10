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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            POS Delivery
          </h1>
          <p className="text-muted-foreground text-sm">Masuk ke akun Anda</p>
        </div>

        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground text-lg">Masuk</CardTitle>
            <CardDescription className="text-muted-foreground">
              Gunakan email dan password yang terdaftar
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground/80">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  autoComplete="email"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-xs">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground/80">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 mt-5">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>

              <p className="text-muted-foreground text-sm text-center">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:text-primary/80 font-medium"
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
