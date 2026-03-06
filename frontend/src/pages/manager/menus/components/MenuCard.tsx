import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ImagePlus,
  CheckCircle,
  XCircle,
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

export function MenuCard({ menu, onEdit, onDelete, onManageImages }: Props) {
  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-4/3 bg-slate-800 overflow-hidden">
        {menu.first_image_url ? (
          <img
            src={menu.first_image_url}
            alt={menu.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
            <ImagePlus className="w-8 h-8" />
            <span className="text-xs">Belum ada gambar</span>
          </div>
        )}

        {/* Image count badge */}
        {menu.images.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-sm">
            {menu.images.length} foto
          </div>
        )}

        {/* Actions overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="w-7 h-7 bg-black/60 hover:bg-black/80 backdrop-blur-sm border-0"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-slate-900 border-slate-700 text-slate-200"
            >
              <DropdownMenuItem
                className="gap-2 text-sm hover:bg-slate-800 cursor-pointer"
                onClick={() => onEdit(menu)}
              >
                <Pencil className="w-3.5 h-3.5 text-slate-400" /> Edit Menu
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-sm hover:bg-slate-800 cursor-pointer"
                onClick={() => onManageImages(menu)}
              >
                <ImagePlus className="w-3.5 h-3.5 text-slate-400" /> Kelola
                Gambar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                className="gap-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                onClick={() => onDelete(menu)}
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Menu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {menu.name}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {menu.category}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] shrink-0 gap-1",
              menu.is_available
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30",
            )}
          >
            {menu.is_available ? (
              <>
                <CheckCircle className="w-2.5 h-2.5" />
                Tersedia
              </>
            ) : (
              <>
                <XCircle className="w-2.5 h-2.5" />
                Habis
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-amber-400 font-bold text-sm">
            {menu.formatted_price}
          </span>
          {menu.stock !== null && (
            <span className="text-xs text-slate-500">Stok: {menu.stock}</span>
          )}
        </div>

        {menu.description && (
          <p className="text-xs text-slate-500 line-clamp-2">
            {menu.description}
          </p>
        )}
      </div>
    </div>
  );
}
