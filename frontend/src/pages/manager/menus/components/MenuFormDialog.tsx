/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { menuSchema, type MenuForm } from "../schemas";
import type { Menu } from "@/types/menu";

const PRESET_CATEGORIES = ["Makanan", "Minuman", "Snack", "Dessert", "Paket"];

interface CreateProps {
  mode: "create";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: MenuForm) => void;
  isLoading: boolean;
  categories: string[];
}

interface EditProps {
  mode: "edit";
  menu: Menu | null;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: MenuForm) => void;
  isLoading: boolean;
  categories: string[];
}

type Props = CreateProps | EditProps;

export function MenuFormDialog(props: Props) {
  const isEdit = props.mode === "edit";
  const open = isEdit
    ? !!(props as EditProps).menu
    : (props as CreateProps).open;
  const menu = isEdit ? (props as EditProps).menu : null;

  const allCategories = Array.from(
    new Set([...PRESET_CATEGORIES, ...props.categories]),
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MenuForm>({
    resolver: zodResolver(menuSchema) as any, // Type assertion sementara
    defaultValues: {
      is_available: true,
      preparation_time: 15,
    },
  });

  useEffect(() => {
    if (isEdit && menu) {
      reset({
        name: menu.name,
        description: menu.description ?? "",
        price: menu.price,
        category: menu.category,
        is_available: menu.is_available,
        stock: menu.stock,
        preparation_time: menu.preparation_time,
      });
    } else if (!isEdit) {
      reset({
        is_available: true,
        preparation_time: 15,
      });
    }
  }, [menu, isEdit, reset]);

  const handleClose = () => {
    props.onOpenChange(false);
    reset();
  };

  // Handler untuk transform data sebelum submit
  const handleFormSubmit = (data: MenuForm) => {
    // Pastikan data sudah dalam format yang benar
    const formattedData: MenuForm = {
      ...data,
      price: Number(data.price),
      stock: data.stock === null ? undefined : data.stock,
      preparation_time: Number(data.preparation_time),
    };
    props.onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEdit ? "Edit Menu" : "Tambah Menu Baru"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEdit ? `Edit data untuk ${menu?.name}` : "Isi data menu baru"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-2"
        >
          {/* Nama */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Nama Menu</Label>
            <Input
              placeholder="Nasi Goreng Spesial"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-400 text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">
              Deskripsi (opsional)
            </Label>
            <Textarea
              placeholder="Deskripsi singkat menu..."
              rows={3}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-400 text-xs">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Harga + Kategori */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Harga (Rp)</Label>
              <Input
                type="number"
                placeholder="35000"
                min={0}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-red-400 text-xs">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Kategori</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {allCategories.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="text-slate-300"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-red-400 text-xs">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          {/* Stok + Waktu Persiapan */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">
                Stok (kosongkan = unlimited)
              </Label>
              <Input
                type="number"
                placeholder="Unlimited"
                min={0}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                {...register("stock")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">
                Waktu Persiapan (menit)
              </Label>
              <Input
                type="number"
                placeholder="15"
                min={1}
                max={120}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                {...register("preparation_time")}
              />
            </div>
          </div>

          {/* Toggle Tersedia */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
            <div>
              <p className="text-sm font-medium text-white">
                Tersedia untuk dipesan
              </p>
              <p className="text-xs text-slate-500">
                Tampilkan menu ini ke pelanggan
              </p>
            </div>
            <Controller
              name="is_available"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-amber-500"
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={handleClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={props.isLoading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
            >
              {props.isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {props.isLoading
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan"
                  : "Buat Menu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
