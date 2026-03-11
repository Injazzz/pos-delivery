import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Menu } from "@/types/menu";

interface Props {
  menu: Menu;
  onAdd: (menu: Menu) => void;
  qty: number; // jumlah di keranjang saat ini
}

export function MenuCard({ menu, onAdd, qty }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const images = menu.images || [];
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex]?.url || menu.first_image_url;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <Card
      className={cn(
        "bg-card border-border overflow-hidden transition-all duration-200 group",
        !menu.is_available && "opacity-50",
        menu.is_available &&
          "hover:border-heart-500/30 hover:shadow-md hover:shadow-heart-500/5",
      )}
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
                    onClick={(e) => handleDotClick(e, idx)}
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
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImageOff className="w-6 h-6 opacity-30" />
            <span className="text-[10px] font-medium">Tidak ada gambar</span>
          </div>
        )}

        {/* Qty badge */}
        {qty > 0 && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-heart-500 rounded-full flex items-center justify-center shadow-lg border-2 border-background">
            <span className="text-[10px] font-bold text-white">{qty}</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="outline"
            className="text-[8px] font-medium backdrop-blur-sm bg-background/60 border-border text-muted-foreground"
          >
            {menu.category}
          </Badge>
        </div>

        {/* Unavailable overlay */}
        {!menu.is_available && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
            <Badge className="bg-destructive/90 text-destructive-foreground text-[10px] border-0 px-2 py-1">
              Habis
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Name */}
        <div>
          <p className="text-sm font-semibold text-foreground line-clamp-1">
            {menu.name}
          </p>
        </div>

        {/* Description */}
        {menu.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {menu.description}
          </p>
        )}

        {/* Price & add button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            <span className="text-sm font-bold text-heart-500">
              {menu.formatted_price}
            </span>
            {menu.stock !== null && menu.stock > 0 && (
              <p className="text-[8px] text-muted-foreground">
                Stok: {menu.stock}
              </p>
            )}
          </div>
          <Button
            size="icon"
            className={cn(
              "w-8 h-8 rounded-full transition-all",
              qty > 0
                ? "bg-heart-500 hover:bg-heart-600 text-foreground scale-110 shadow-md shadow-heart-500/20"
                : "bg-muted hover:bg-heart-500 hover:text-foreground text-muted-foreground",
              !menu.is_available &&
                "opacity-50 cursor-not-allowed pointer-events-none",
            )}
            disabled={!menu.is_available}
            onClick={() => onAdd(menu)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Stock warning */}
        {menu.is_available &&
          menu.stock !== null &&
          menu.stock <= 5 &&
          menu.stock > 0 && (
            <p className="text-[8px] text-glow-500 mt-1">Sisa {menu.stock}</p>
          )}
      </CardContent>
    </Card>
  );
}
