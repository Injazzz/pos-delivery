import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2, Utensils } from "lucide-react";
import type { Menu } from "@/types/menu";
import { cn } from "@/lib/utils";

interface Props {
  menu: Menu | null;
  onOpenChange: (v: boolean) => void;
  onConfirm: (id: number) => void;
  isLoading: boolean;
}

export function MenuDeleteDialog({
  menu,
  onOpenChange,
  onConfirm,
  isLoading,
}: Props) {
  // Cek apakah menu memiliki gambar untuk ditampilkan
  const hasImage = menu?.first_image_url;

  return (
    <AlertDialog open={!!menu} onOpenChange={(v) => !v && onOpenChange(false)}>
      <AlertDialogContent className="bg-card border-border sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            {/* Icon/Image section */}
            <div
              className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden",
                hasImage ? "border border-border" : "bg-destructive/10",
              )}
            >
              {hasImage ? (
                <img
                  src={menu.first_image_url}
                  alt={menu.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-destructive">
                  <Utensils className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Title and description */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertDialogTitle className="text-foreground text-lg">
                  Hapus Menu?
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-muted-foreground text-sm">
                Menu{" "}
                <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                  {menu?.name}
                </span>{" "}
                akan dihapus secara permanen.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Warning section */}
        <div className="mt-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-destructive">
                Perhatian: Tindakan ini akan:
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                <li>Menghapus menu dari katalog</li>
                <li>Menghapus semua gambar terkait</li>
                <li>Data pesanan yang sudah ada tetap tersimpan</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Menu info card */}
        {menu && (
          <div className="bg-muted/50 border border-border rounded-lg p-3 mt-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Kategori:</span>
                <span className="ml-1 font-medium text-foreground">
                  {menu.category}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Harga:</span>
                <span className="ml-1 font-medium text-heart-500">
                  {menu.formatted_price}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Stok:</span>
                <span className="ml-1 font-medium text-foreground">
                  {menu.stock ?? "Tidak terbatas"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={cn(
                    "ml-1 font-medium",
                    menu.is_available ? "text-emerald-500" : "text-destructive",
                  )}
                >
                  {menu.is_available ? "Tersedia" : "Habis"}
                </span>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
          <AlertDialogCancel
            className="bg-muted border-border text-foreground hover:bg-muted/80 hover:text-foreground transition-all"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </AlertDialogCancel>

          <AlertDialogAction
            className={cn(
              "bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all min-w-25",
              isLoading && "opacity-70 cursor-not-allowed",
            )}
            disabled={isLoading}
            onClick={() => menu && onConfirm(menu.id)}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </div>
            ) : (
              "Ya, Hapus"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
