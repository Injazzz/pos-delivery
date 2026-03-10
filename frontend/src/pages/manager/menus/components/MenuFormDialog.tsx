/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Utensils, Clock, Package, DollarSign } from "lucide-react";
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
import { cn } from "@/lib/utils";

const PRESET_CATEGORIES = ["Makanan", "Minuman", "Snack", "Dessert", "Paket"];

// Mapping kategori ke warna
const CATEGORY_COLORS: Record<string, string> = {
  makanan: "text-earth-500",
  minuman: "text-heart-500",
  snack: "text-glow-500",
  dessert: "text-emerald-500",
  paket: "text-purple-500",
};

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
    resolver: zodResolver(menuSchema) as any,
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

  const handleFormSubmit = (data: MenuForm) => {
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
      <DialogContent className="bg-card border-border sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isEdit ? "bg-earth-500/20" : "bg-heart-500/20",
              )}
            >
              <Utensils
                className={cn(
                  "w-5 h-5",
                  isEdit ? "text-earth-500" : "text-heart-500",
                )}
              />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">
                {isEdit ? "Edit Menu" : "Tambah Menu Baru"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {isEdit
                  ? `Edit data untuk menu "${menu?.name}"`
                  : "Isi data menu baru untuk ditambahkan ke katalog"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-2"
        >
          {/* Nama Menu */}
          <div className="space-y-1.5">
            <Label className="text-foreground text-sm font-medium flex items-center gap-1">
              Nama Menu
            </Label>
            <Input
              placeholder="Nasi Goreng Spesial"
              className={cn(
                "bg-background border-border text-foreground placeholder:text-muted-foreground",
                "focus:border-heart-500 focus:ring-heart-500/20 transition-all",
                errors.name &&
                  "border-destructive focus:border-destructive focus:ring-destructive/20",
              )}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                <span className="w-1 h-1 rounded-full bg-destructive" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label className="text-foreground text-sm font-medium">
              Deskripsi (opsional)
            </Label>
            <Textarea
              placeholder="Deskripsi singkat menu..."
              rows={3}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 transition-all resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                <span className="w-1 h-1 rounded-full bg-destructive" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Harga + Kategori */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-foreground text-sm font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                Harga (Rp)
              </Label>
              <Input
                type="number"
                placeholder="35000"
                min={0}
                className={cn(
                  "bg-background border-border text-foreground placeholder:text-muted-foreground",
                  "focus:border-heart-500 focus:ring-heart-500/20 transition-all",
                  errors.price &&
                    "border-destructive focus:border-destructive focus:ring-destructive/20",
                )}
                {...register("price")}
              />
              {errors.price && (
                <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground text-sm font-medium">
                <Utensils className="w-3.5 h-3.5 text-muted-foreground" />
                Kategori
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className={cn(
                        "bg-background border-border text-foreground hover:bg-muted/50",
                        "focus:border-heart-500 focus:ring-heart-500/20 transition-all",
                        errors.category &&
                          "border-destructive focus:border-destructive",
                      )}
                    >
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border max-h-62.5">
                      {allCategories.map((c) => {
                        const categoryColor =
                          CATEGORY_COLORS[c.toLowerCase()] || "text-foreground";

                        return (
                          <SelectItem
                            key={c}
                            value={c}
                            className={cn(
                              "focus:bg-muted focus:text-foreground",
                              categoryColor,
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  c.toLowerCase() === "makanan"
                                    ? "bg-earth-500"
                                    : c.toLowerCase() === "minuman"
                                      ? "bg-heart-500"
                                      : c.toLowerCase() === "snack"
                                        ? "bg-glow-500"
                                        : c.toLowerCase() === "dessert"
                                          ? "bg-emerald-500"
                                          : c.toLowerCase() === "paket"
                                            ? "bg-purple-500"
                                            : "bg-muted-foreground",
                                )}
                              />
                              <span>{c}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          {/* Stok + Waktu Persiapan */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-foreground text-sm font-medium flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                Stok (kosongkan = unlimited)
              </Label>
              <Input
                type="number"
                placeholder="Unlimited"
                min={0}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 transition-all"
                {...register("stock")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground text-sm font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Waktu Persiapan (menit)
              </Label>
              <Input
                type="number"
                placeholder="15"
                min={1}
                max={120}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 transition-all"
                {...register("preparation_time")}
              />
            </div>
          </div>

          {/* Toggle Tersedia */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                Tersedia untuk dipesan
              </p>
              <p className="text-xs text-muted-foreground">
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
                  className="data-[state=checked]:bg-heart-500"
                />
              )}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground hover:bg-muted hover:text-foreground transition-all"
              onClick={handleClose}
              disabled={props.isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={props.isLoading}
              className={cn(
                "transition-all min-w-30",
                isEdit
                  ? "bg-earth-500 hover:bg-earth-600 text-white"
                  : "bg-heart-500 hover:bg-heart-600 text-white",
              )}
            >
              {props.isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {props.isLoading
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Buat Menu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
