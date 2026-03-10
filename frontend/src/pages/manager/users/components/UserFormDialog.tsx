/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus, UserCog } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storeUserSchema, updateUserSchema } from "../schemas";
import type { StoreUserForm, UpdateUserForm } from "../schemas";
import type { User } from "@/types/user";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "../types";
import { cn } from "@/lib/utils";

// ── Create Dialog ─────────────────────────────────────────────────────────────

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: StoreUserForm) => void;
  isLoading: boolean;
  fieldErrors?: Record<string, string[]>;
}

export function UserCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  fieldErrors,
}: CreateDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<StoreUserForm>({
    resolver: zodResolver(storeUserSchema),
    defaultValues: { status: "active", role: "pelanggan" },
  });

  // Inject server-side errors
  useEffect(() => {
    if (!fieldErrors) return;
    Object.entries(fieldErrors).forEach(([field, messages]) =>
      setError(field as keyof StoreUserForm, { message: messages[0] }),
    );
  }, [fieldErrors, setError]);

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-heart-500/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-heart-500" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">
                Tambah Pengguna Baru
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Isi data untuk membuat akun pengguna baru.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <UserFormFields
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            mode="create"
          />
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
              className="bg-heart-500 hover:bg-heart-600 text-white transition-all min-w-30"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Menyimpan..." : "Buat Pengguna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Dialog ───────────────────────────────────────────────────────────────

interface EditDialogProps {
  user: User | null;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: UpdateUserForm) => void;
  isLoading: boolean;
  fieldErrors?: Record<string, string[]>;
}

export function UserEditDialog({
  user,
  onOpenChange,
  onSubmit,
  isLoading,
  fieldErrors,
}: EditDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
  });

  // Pre-fill saat user berubah
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? "",
        status: user.status,
        password: "",
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (!fieldErrors) return;
    Object.entries(fieldErrors).forEach(([field, messages]) =>
      setError(field as keyof UpdateUserForm, { message: messages[0] }),
    );
  }, [fieldErrors, setError]);

  return (
    <Dialog open={!!user} onOpenChange={(v) => !v && onOpenChange(false)}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-earth-500/20 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-earth-500" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">
                Edit Pengguna
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Edit data untuk{" "}
                <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                  {user?.name}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <UserFormFields
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            mode="edit"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground hover:bg-muted hover:text-foreground transition-all"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-earth-500 hover:bg-earth-600 text-white transition-all min-w-30"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Shared form fields (dipakai di create & edit) ─────────────────────────────

interface FieldsProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  mode: "create" | "edit";
}

function UserFormFields({
  register,
  errors,
  setValue,
  watch,
  mode,
}: FieldsProps) {
  const TEXT_FIELDS = [
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
      label: "No HP",
      type: "tel",
      placeholder: "081234567890 (opsional)",
    },
    {
      id: "password",
      label:
        mode === "create"
          ? "Password"
          : "Password Baru (kosongkan jika tidak diubah)",
      type: "password",
      placeholder: "••••••••",
    },
  ];

  // Helper untuk mendapatkan warna role
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      manager: "text-heart-500 border-heart-500/30 bg-heart-500/10",
      kasir: "text-earth-500 border-earth-500/30 bg-earth-500/10",
      kurir: "text-glow-500 border-glow-500/30 bg-glow-500/10",
      pelanggan: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
    };
    return colors[role] || "";
  };

  // Helper untuk mendapatkan warna status
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
      inactive: "text-muted-foreground border-border bg-muted",
    };
    return colors[status] || "";
  };

  return (
    <>
      {TEXT_FIELDS.map((f) => (
        <div key={f.id} className="space-y-1.5">
          <Label className="text-foreground text-sm font-medium">
            {f.label}
            {f.id === "phone" && mode === "create" && (
              <span className="text-muted-foreground text-xs ml-2">
                (opsional)
              </span>
            )}
          </Label>
          <Input
            type={f.type}
            placeholder={f.placeholder}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 transition-all"
            {...register(f.id)}
          />
          {errors[f.id] && (
            <p className="text-destructive text-xs flex items-center gap-1 mt-1">
              <span className="w-1 h-1 rounded-full bg-destructive" />
              {errors[f.id]?.message}
            </p>
          )}
        </div>
      ))}

      {/* Role */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-sm font-medium">Role</Label>
        <Select
          value={watch("role") ?? ""}
          onValueChange={(v) => setValue("role", v, { shouldValidate: true })}
        >
          <SelectTrigger className="bg-background border-border text-foreground hover:bg-muted/50 focus:border-heart-500 focus:ring-heart-500/20 transition-all">
            <SelectValue placeholder="Pilih role" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {ROLE_OPTIONS.map((r) => (
              <SelectItem
                key={r.value}
                value={r.value}
                className={cn(
                  "text-foreground focus:bg-muted focus:text-foreground",
                  getRoleColor(r.value),
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      r.value === "manager"
                        ? "bg-heart-500"
                        : r.value === "kasir"
                          ? "bg-earth-500"
                          : r.value === "kurir"
                            ? "bg-glow-500"
                            : r.value === "pelanggan"
                              ? "bg-emerald-500"
                              : "bg-muted-foreground",
                    )}
                  />
                  {r.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-destructive text-xs flex items-center gap-1 mt-1">
            <span className="w-1 h-1 rounded-full bg-destructive" />
            {errors.role?.message}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-sm font-medium">Status</Label>
        <Select
          value={watch("status") ?? "active"}
          onValueChange={(v) => setValue("status", v, { shouldValidate: true })}
        >
          <SelectTrigger className="bg-background border-border text-foreground hover:bg-muted/50 focus:border-heart-500 focus:ring-heart-500/20 transition-all">
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {STATUS_OPTIONS.map((s) => (
              <SelectItem
                key={s.value}
                value={s.value}
                className={cn(
                  "text-foreground focus:bg-muted focus:text-foreground",
                  getStatusColor(s.value),
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      s.value === "active"
                        ? "bg-emerald-500"
                        : "bg-muted-foreground",
                    )}
                  />
                  {s.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-destructive text-xs flex items-center gap-1 mt-1">
            <span className="w-1 h-1 rounded-full bg-destructive" />
            {errors.status?.message}
          </p>
        )}
      </div>
    </>
  );
}
