/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
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
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Tambah Pengguna Baru</DialogTitle>
          <DialogDescription className="text-slate-400">
            Isi data untuk membuat akun pengguna baru.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <UserFormFields
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            mode="create"
          />
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
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Pengguna</DialogTitle>
          <DialogDescription className="text-slate-400">
            Edit data untuk <span className="text-white">{user?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <UserFormFields
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            mode="edit"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
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

  return (
    <>
      {TEXT_FIELDS.map((f) => (
        <div key={f.id} className="space-y-1.5">
          <Label className="text-slate-300 text-sm">{f.label}</Label>
          <Input
            type={f.type}
            placeholder={f.placeholder}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
            {...register(f.id)}
          />
          {errors[f.id] && (
            <p className="text-red-400 text-xs">{errors[f.id]?.message}</p>
          )}
        </div>
      ))}

      {/* Role */}
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm">Role</Label>
        <Select
          value={watch("role") ?? ""}
          onValueChange={(v) => setValue("role", v, { shouldValidate: true })}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300">
            <SelectValue placeholder="Pilih role" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {ROLE_OPTIONS.map((r) => (
              <SelectItem
                key={r.value}
                value={r.value}
                className="text-slate-300"
              >
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-red-400 text-xs">{errors.role?.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm">Status</Label>
        <Select
          value={watch("status") ?? "active"}
          onValueChange={(v) => setValue("status", v, { shouldValidate: true })}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300">
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {STATUS_OPTIONS.map((s) => (
              <SelectItem
                key={s.value}
                value={s.value}
                className="text-slate-300"
              >
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-red-400 text-xs">{errors.status?.message}</p>
        )}
      </div>
    </>
  );
}
