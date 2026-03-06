import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserFilters } from "@/types/user";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  filters: UserFilters;
  onFilterChange: (patch: Partial<UserFilters>) => void;
}

export function UserFiltersBar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Cari nama, email, no HP..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
        />
      </div>

      {/* Role filter */}
      <Select
        value={filters.role ?? "all"}
        onValueChange={(v) =>
          onFilterChange({ role: v === "all" ? undefined : v, page: 1 })
        }
      >
        <SelectTrigger className="w-full sm:w-36 bg-slate-900 border-slate-700 text-slate-300">
          <SelectValue placeholder="Semua Role" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700">
          {[
            { value: "all", label: "Semua Role" },
            { value: "manager", label: "Manager" },
            { value: "kasir", label: "Kasir" },
            { value: "kurir", label: "Kurir" },
            { value: "pelanggan", label: "Pelanggan" },
          ].map((o) => (
            <SelectItem
              key={o.value}
              value={o.value}
              className="text-slate-300"
            >
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) =>
          onFilterChange({ status: v === "all" ? undefined : v, page: 1 })
        }
      >
        <SelectTrigger className="w-full sm:w-36 bg-slate-900 border-slate-700 text-slate-300">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700">
          {[
            { value: "all", label: "Semua Status" },
            { value: "active", label: "Aktif" },
            { value: "inactive", label: "Nonaktif" },
          ].map((o) => (
            <SelectItem
              key={o.value}
              value={o.value}
              className="text-slate-300"
            >
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
