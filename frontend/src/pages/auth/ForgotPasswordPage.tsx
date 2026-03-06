/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, UtensilsCrossed, ArrowLeft } from "lucide-react";
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

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
});
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Gagal mengirim email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30">
            <UtensilsCrossed className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold text-white">Lupa Password</h1>
          <p className="text-slate-400 text-sm">
            Masukkan email untuk reset password
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Link reset akan dikirim ke email Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    placeholder="email@contoh.com"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
                >
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Kirim Link Reset
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">✉️</span>
              </div>
              <p className="text-white font-medium">Email terkirim!</p>
              <p className="text-slate-400 text-sm">
                Cek inbox Anda dan ikuti instruksi reset password.
              </p>
            </CardContent>
          )}
        </Card>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
