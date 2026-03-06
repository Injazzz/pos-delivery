import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetPasswordSchema } from "../schemas";
import type { ResetPasswordForm } from "../schemas";
import type { User } from "@/types/user";

interface Props {
  user: User | null;
  onOpenChange: (v: boolean) => void;
  onSubmit: (userId: number, data: ResetPasswordForm) => void;
  isLoading: boolean;
}

export function UserResetPasswordDialog({
  user,
  onOpenChange,
  onSubmit,
  isLoading,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const onFormSubmit = (data: ResetPasswordForm) => {
    if (!user) return;
    onSubmit(user.id, data);
    reset();
  };

  return (
    <Dialog open={!!user} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Reset Password</DialogTitle>
          <DialogDescription className="text-slate-400">
            Set password baru untuk{" "}
            <span className="text-white">{user?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
          {[
            {
              id: "password",
              label: "Password Baru",
              placeholder: "Minimal 8 karakter",
            },
            {
              id: "password_confirmation",
              label: "Konfirmasi Password",
              placeholder: "Ulangi password",
            },
          ].map((f) => (
            <div key={f.id} className="space-y-1.5">
              <Label className="text-slate-300 text-sm">{f.label}</Label>
              <Input
                type="password"
                placeholder={f.placeholder}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                {...register(f.id as keyof ResetPasswordForm)}
              />
              {errors[f.id as keyof ResetPasswordForm] && (
                <p className="text-red-400 text-xs">
                  {errors[f.id as keyof ResetPasswordForm]?.message}
                </p>
              )}
            </div>
          ))}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => handleClose(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Menyimpan..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
