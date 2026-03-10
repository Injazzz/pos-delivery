import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ImagePlus,
  CheckCircle,
  XCircle,
  Utensils,
  Clock,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Menu } from "@/types/menu";

interface Props {
  menu: Menu;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onManageImages: (menu: Menu) => void;
}

// Mapping category ke warna
const CATEGORY_COLORS: Record<string, string> = {
  makanan: "bg-earth-500/10 text-earth-500 border-earth-500/30",
  minuman: "bg-heart-500/10 text-heart-500 border-heart-500/30",
  snack: "bg-glow-500/10 text-glow-500 border-glow-500/30",
  dessert: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
};

export function MenuCard({ menu, onEdit, onDelete, onManageImages }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const categoryColor =
    CATEGORY_COLORS[menu.category?.toLowerCase()] ||
    "bg-muted text-muted-foreground border-border";

  const images = menu.images || [];
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = images[currentImageIndex]?.url || menu.first_image_url;

  return (
    <div
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-heart-500/30 hover:shadow-lg hover:shadow-heart-500/5 transition-all duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image Section with Slider */}
      <div className="relative aspect-4/3 bg-muted overflow-hidden">
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt={menu.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Image Navigation Arrows - Muncul saat hover */}
            {hasMultipleImages && isHovering && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm flex items-center justify-center hover:bg-background transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm flex items-center justify-center hover:bg-background transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </>
            )}

            {/* Image Indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      idx === currentImageIndex
                        ? "bg-heart-500 w-3"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                    )}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Utensils className="w-10 h-10 opacity-30" />
            <span className="text-xs font-medium">Belum ada gambar</span>
          </div>
        )}

        {/* Category badge di atas gambar */}
        <div className="absolute top-2 left-2 z-10">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-medium backdrop-blur-sm bg-background/60",
              categoryColor,
            )}
          >
            {menu.category}
          </Badge>
        </div>

        {/* Actions overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 bg-background/80 hover:bg-background backdrop-blur-sm border border-border shadow-sm"
              >
                <MoreHorizontal className="w-4 h-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-popover border-border"
            >
              <DropdownMenuItem
                className="gap-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                onClick={() => onEdit(menu)}
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                Edit Menu
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                onClick={() => onManageImages(menu)}
              >
                <ImagePlus className="w-3.5 h-3.5 text-muted-foreground" />
                Kelola Gambar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="gap-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                onClick={() => onDelete(menu)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Menu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info Section (tetap sama) */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-foreground truncate leading-tight">
              {menu.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-8">
              {menu.description || "Tidak ada deskripsi"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-heart-500">
              {menu.formatted_price}
            </span>
            <span className="text-[10px] text-muted-foreground">/item</span>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-medium gap-1",
              menu.is_available
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                : "bg-destructive/10 text-destructive border-destructive/30",
            )}
          >
            {menu.is_available ? (
              <>
                <CheckCircle className="w-3 h-3" />
                Tersedia
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Habis
              </>
            )}
          </Badge>
        </div>

        {/* Stock info */}
        {menu.stock !== null && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Package className="w-3.5 h-3.5" />
              <span>Stok:</span>
            </div>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  menu.stock > 10
                    ? "bg-emerald-500"
                    : menu.stock > 0
                      ? "bg-glow-500"
                      : "bg-destructive",
                )}
                style={{ width: `${Math.min((menu.stock / 50) * 100, 100)}%` }}
              />
            </div>
            <span
              className={cn(
                "font-medium",
                menu.stock > 10
                  ? "text-emerald-500"
                  : menu.stock > 0
                    ? "text-glow-500"
                    : "text-destructive",
              )}
            >
              {menu.stock}
            </span>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center gap-3 pt-2 border-t border-border text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              Dibuat: {new Date(menu.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
