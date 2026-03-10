import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, KeyRound, Lock, ShieldAlert } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-glow-500/20 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-glow-500" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">
                Reset Password
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Set password baru untuk akun
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-heart-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-heart-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {[
            {
              id: "password",
              label: "Password Baru",
              placeholder: "Minimal 8 karakter",
              icon: Lock,
            },
            {
              id: "password_confirmation",
              label: "Konfirmasi Password",
              placeholder: "Ulangi password",
              icon: Lock,
            },
          ].map((f) => {
            const Icon = f.icon;
            const fieldId = f.id as keyof ResetPasswordForm;

            return (
              <div key={f.id} className="space-y-1.5">
                <Label className="text-foreground text-sm font-medium flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {f.label}
                </Label>
                <Input
                  type="password"
                  placeholder={f.placeholder}
                  className={cn(
                    "bg-background border-border text-foreground placeholder:text-muted-foreground",
                    "focus:border-glow-500 focus:ring-glow-500/20 transition-all",
                    errors[fieldId] &&
                      "border-destructive focus:border-destructive focus:ring-destructive/20",
                  )}
                  {...register(fieldId)}
                />
                {errors[fieldId] && (
                  <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 rounded-full bg-destructive" />
                    {errors[fieldId]?.message}
                  </p>
                )}
              </div>
            );
          })}

          {/* Password requirements hint */}
          <div className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border">
            <p className="font-medium mb-1">Syarat Password:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Minimal 8 karakter</li>
              <li>Harus sama dengan konfirmasi</li>
              <li>Tidak boleh sama dengan password lama</li>
            </ul>
          </div>

          <DialogFooter className="gap-1 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground hover:bg-muted hover:text-foreground transition-all"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-glow-500 hover:bg-glow-600 text-foreground font-semibold transition-all min-w-30"
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
