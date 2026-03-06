import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, UtensilsCrossed } from "lucide-react";
import { MenuCard } from "./MenuCard";
import type { Menu } from "@/types/menu";

interface Meta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
}

interface Props {
  menus: Menu[];
  isLoading: boolean;
  meta?: Meta;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onManageImages: (menu: Menu) => void;
  onPageChange: (page: number) => void;
}

export function MenuGrid({
  menus,
  isLoading,
  meta,
  onEdit,
  onDelete,
  onManageImages,
  onPageChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading &&
          Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              <Skeleton className="aspect-4/3 bg-slate-800 w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-3 w-1/2 bg-slate-800" />
                <Skeleton className="h-4 w-1/3 bg-slate-800" />
              </div>
            </div>
          ))}

        {!isLoading && menus.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 py-16 text-slate-500">
            <UtensilsCrossed className="w-10 h-10" />
            <p className="text-sm">Tidak ada menu ditemukan</p>
          </div>
        )}

        {!isLoading &&
          menus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onEdit={onEdit}
              onDelete={onDelete}
              onManageImages={onManageImages}
            />
          ))}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Menampilkan {meta.from}–{meta.to} dari {meta.total} menu
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 py-1 text-xs text-white bg-slate-800 rounded-md border border-slate-700">
              {meta.current_page} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => onPageChange(meta.current_page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
