import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MenuFilters } from "@/types/menu";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  filters: MenuFilters;
  onFilterChange: (patch: Partial<MenuFilters>) => void;
  categories: string[];
}

export function MenuFiltersBar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  categories,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Cari nama menu..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
        />
      </div>

      <Select
        value={filters.category ?? "all"}
        onValueChange={(v) =>
          onFilterChange({ category: v === "all" ? undefined : v, page: 1 })
        }
      >
        <SelectTrigger className="w-full sm:w-40 bg-slate-900 border-slate-700 text-slate-300">
          <SelectValue placeholder="Semua Kategori" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700">
          <SelectItem value="all" className="text-slate-300">
            Semua Kategori
          </SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c} className="text-slate-300 capitalize">
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(filters.is_available ?? "all")}
        onValueChange={(v) =>
          onFilterChange({
            is_available: v === "all" ? undefined : v === "true",
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full sm:w-40 bg-slate-900 border-slate-700 text-slate-300">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700">
          <SelectItem value="all" className="text-slate-300">
            Semua Status
          </SelectItem>
          <SelectItem value="true" className="text-slate-300">
            Tersedia
          </SelectItem>
          <SelectItem value="false" className="text-slate-300">
            Tidak Tersedia
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
