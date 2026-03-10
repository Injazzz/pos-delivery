/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { authApi } from "@/api/auth";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Minimal 8 karakter")
      .regex(/[a-zA-Z]/)
      .regex(/[0-9]/),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
  });
type Form = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    const token = params.get("token") ?? "";
    const email = params.get("email") ?? "";
    if (!token || !email) {
      toast.error("Link tidak valid.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, email, ...data });
      toast.success("Password berhasil direset!");
      navigate("/login");
    } catch (err: any) {
      const apiErr = err.response?.data;
      if (apiErr?.errors) {
        Object.entries(apiErr.errors).forEach(([f, m]) =>
          setError(f as keyof Form, { message: (m as string[])[0] }),
        );
      } else {
        toast.error(apiErr?.message ?? "Gagal reset password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
        </div>
        <Card className="bg-card border-border\">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="text-foreground text-lg">
                Password Baru
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Masukkan password baru Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: "password", label: "Password Baru" },
                { id: "password_confirmation", label: "Konfirmasi Password" },
              ].map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <Label className="text-foreground/80">{f.label}</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                    {...register(f.id as keyof Form)}
                  />
                  {errors[f.id as keyof Form] && (
                    <p className="text-destructive text-xs">
                      {errors[f.id as keyof Form]?.message}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="mt-5">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Password Baru
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
