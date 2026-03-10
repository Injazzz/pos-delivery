import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MenuFilters } from "@/types/menu";
import { cn } from "@/lib/utils";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  filters: MenuFilters;
  onFilterChange: (patch: Partial<MenuFilters>) => void;
  categories: string[];
}

// Mapping category ke warna untuk dropdown items
const CATEGORY_COLORS: Record<string, string> = {
  makanan: "text-earth-500",
  minuman: "text-heart-500",
  snack: "text-glow-500",
  dessert: "text-emerald-500",
};

export function MenuFiltersBar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  categories,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama menu..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 transition-all"
        />
      </div>

      {/* Category filter */}
      <Select
        value={filters.category ?? "all"}
        onValueChange={(v) =>
          onFilterChange({ category: v === "all" ? undefined : v, page: 1 })
        }
      >
        <SelectTrigger className="w-full sm:w-44 bg-background border-border text-foreground hover:bg-muted/50 focus:border-heart-500 focus:ring-heart-500/20 transition-all">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <SelectValue placeholder="Semua Kategori" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-75">
          <SelectItem
            value="all"
            className="text-foreground focus:bg-muted focus:text-foreground"
          >
            <div className="flex items-center gap-2">
              <span>Semua Kategori</span>
            </div>
          </SelectItem>
          {categories.map((c) => {
            const categoryColor =
              CATEGORY_COLORS[c.toLowerCase()] || "text-muted-foreground";

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
                              : "bg-muted-foreground",
                    )}
                  />
                  <span className="capitalize">{c}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={String(filters.is_available ?? "all")}
        onValueChange={(v) =>
          onFilterChange({
            is_available: v === "all" ? undefined : v === "true",
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full sm:w-40 bg-background border-border text-foreground hover:bg-muted/50 focus:border-heart-500 focus:ring-heart-500/20 transition-all">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem
            value="all"
            className="text-foreground focus:bg-muted focus:text-foreground"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span>Semua Status</span>
            </div>
          </SelectItem>
          <SelectItem
            value="true"
            className="text-emerald-500 focus:bg-muted focus:text-emerald-500"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Tersedia</span>
            </div>
          </SelectItem>
          <SelectItem
            value="false"
            className="text-destructive focus:bg-muted focus:text-destructive"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              <span>Tidak Tersedia</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
