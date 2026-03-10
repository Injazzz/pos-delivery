import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Soup,
  Pizza,
  Coffee,
} from "lucide-react";
import { MenuCard } from "./MenuCard";
import type { Menu } from "@/types/menu";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      {/* Grid Menu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Loading Skeletons */}
        {isLoading &&
          Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl overflow-hidden animate-pulse"
            >
              <Skeleton className="aspect-4/3 bg-muted w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-1/2 bg-muted" />
                <Skeleton className="h-4 w-1/3 bg-muted" />
              </div>
            </div>
          ))}

        {/* Empty State */}
        {!isLoading && menus.length === 0 && (
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center bg-card border border-border rounded-xl">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <ChefHat className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Tidak ada menu ditemukan
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Coba ubah filter pencarian atau tambah menu baru untuk mulai
                  menampilkan menu
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-earth-500/10 flex items-center justify-center">
                    <Soup className="w-4 h-4 text-earth-500" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-heart-500/10 flex items-center justify-center">
                    <Pizza className="w-4 h-4 text-heart-500" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-glow-500/10 flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-glow-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Cards */}
        {!isLoading &&
          menus.map((menu, index) => (
            <div
              key={menu.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <MenuCard
                menu={menu}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageImages={onManageImages}
              />
            </div>
          ))}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground order-2 sm:order-1">
            Menampilkan {meta.from}–{meta.to} dari {meta.total} menu
          </span>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-8 h-8 bg-background border-border text-muted-foreground",
                "hover:bg-muted hover:text-foreground",
                "disabled:opacity-30 disabled:hover:bg-background",
                "transition-all",
              )}
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                let pageNumber: number | null = null;

                if (meta.last_page <= 5) {
                  pageNumber = i + 1;
                } else {
                  const current = meta.current_page;
                  if (current <= 3) {
                    pageNumber = i + 1;
                  } else if (current >= meta.last_page - 2) {
                    pageNumber = meta.last_page - 4 + i;
                  } else {
                    pageNumber = current - 2 + i;
                  }
                }

                if (
                  !pageNumber ||
                  pageNumber < 1 ||
                  pageNumber > meta.last_page
                )
                  return null;

                const isActive = pageNumber === meta.current_page;

                return (
                  <Button
                    key={pageNumber}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-8 h-8 p-0 text-xs font-medium",
                      isActive
                        ? "bg-heart-500 hover:bg-heart-600 text-white shadow-sm shadow-heart-500/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-8 h-8 bg-background border-border text-muted-foreground",
                "hover:bg-muted hover:text-foreground",
                "disabled:opacity-30 disabled:hover:bg-background",
                "transition-all",
              )}
              disabled={meta.current_page >= meta.last_page}
              onClick={() => onPageChange(meta.current_page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer info untuk total menu */}
      {!isLoading && menus.length > 0 && (
        <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground border-t border-border pt-3">
          <div className="w-px h-3 bg-border mx-1" />
          <span>
            Total {menus.filter((m) => m.is_available).length} menu tersedia
          </span>
        </div>
      )}
    </div>
  );
}
