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
        "bg-slate-900 border-slate-800 overflow-hidden transition-all duration-200",
        !menu.is_available && "opacity-50",
        menu.is_available && "hover:border-slate-700",
      )}
    >
      {/* Image */}
      <div className="relative aspect-4/3 bg-slate-800 overflow-hidden">
        {menu.first_image_url ? (
          <img
            src={menu.first_image_url}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
            No Image
          </div>
        )}

        {/* Qty badge */}
        {qty > 0 && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-[10px] font-bold text-slate-950">{qty}</span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!menu.is_available && (
          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
            <Badge className="bg-red-500/90 text-white text-[10px] border-0">
              Habis
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Name & category */}
        <div>
          <p className="text-sm font-semibold text-white line-clamp-1">
            {menu.name}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 capitalize">
            {menu.category}
          </p>
        </div>

        {/* Description */}
        {menu.description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {menu.description}
          </p>
        )}

        {/* Price & add button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-sm font-bold text-amber-400">
            {menu.formatted_price}
          </span>
          <Button
            size="icon"
            className={cn(
              "w-7 h-7 rounded-full transition-all",
              qty > 0
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 scale-110"
                : "bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300",
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
