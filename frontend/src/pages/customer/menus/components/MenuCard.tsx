import { Plus } from "lucide-react";
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
  return (
    <Card
      className={cn(
        "bg-card border-border overflow-hidden transition-all duration-200",
        !menu.is_available && "opacity-50",
        menu.is_available && "hover:border-border",
      )}
    >
      {/* Image */}
      <div className="relative aspect-4/3 bg-muted overflow-hidden">
        {menu.first_image_url ? (
          <img
            src={menu.first_image_url}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}

        {/* Qty badge */}
        {qty > 0 && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <span className="text-[10px] font-bold text-accent-foreground">
              {qty}
            </span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!menu.is_available && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <Badge className="bg-primary/90 text-primary-foreground text-[10px] border-0">
              Habis
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Name & category */}
        <div>
          <p className="text-sm font-semibold text-foreground line-clamp-1">
            {menu.name}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
            {menu.category}
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
          <span className="text-sm font-bold text-accent">
            {menu.formatted_price}
          </span>
          <Button
            size="icon"
            className={cn(
              "w-7 h-7 rounded-full transition-all",
              qty > 0
                ? "bg-accent hover:bg-accent/90 text-accent-foreground scale-110"
                : "bg-muted hover:bg-accent hover:text-accent-foreground text-muted-foreground",
            )}
            disabled={!menu.is_available}
            onClick={() => onAdd(menu)}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
