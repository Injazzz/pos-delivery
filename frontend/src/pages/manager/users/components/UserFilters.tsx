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
import { cn } from "@/lib/utils";

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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama, email, no HP..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 transition-all"
        />
      </div>

      {/* Role filter */}
      <Select
        value={filters.role ?? "all"}
        onValueChange={(v) =>
          onFilterChange({ role: v === "all" ? undefined : v, page: 1 })
        }
      >
        <SelectTrigger className="w-full sm:w-40 bg-background border-border text-foreground hover:bg-muted/50 focus:border-heart-500 focus:ring-heart-500/20 transition-all">
          <SelectValue placeholder="Semua Role" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {[
            { value: "all", label: "Semua Role" },
            { value: "manager", label: "Manager" },
            { value: "kasir", label: "Kasir" },
            { value: "kurir", label: "Kurir" },
            { value: "pelanggan", label: "Pelanggan" },
          ].map((o) => {
            // Warna badge untuk setiap role
            const roleColor =
              o.value === "manager"
                ? "text-heart-500"
                : o.value === "kasir"
                  ? "text-earth-500"
                  : o.value === "kurir"
                    ? "text-glow-500"
                    : o.value === "pelanggan"
                      ? "text-emerald-500"
                      : "";

            return (
              <SelectItem
                key={o.value}
                value={o.value}
                className={cn(
                  "text-foreground focus:bg-muted focus:text-foreground",
                  o.value !== "all" && roleColor,
                )}
              >
                {o.value !== "all" ? (
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        o.value === "manager"
                          ? "bg-heart-500"
                          : o.value === "kasir"
                            ? "bg-earth-500"
                            : o.value === "kurir"
                              ? "bg-glow-500"
                              : o.value === "pelanggan"
                                ? "bg-emerald-500"
                                : "",
                      )}
                    />
                    {o.label}
                  </div>
                ) : (
                  o.label
                )}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) =>
          onFilterChange({ status: v === "all" ? undefined : v, page: 1 })
        }
      >
        <SelectTrigger className="w-full sm:w-40 bg-background border-border text-foreground hover:bg-muted/50 focus:border-heart-500 focus:ring-heart-500/20 transition-all">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {[
            { value: "all", label: "Semua Status" },
            { value: "active", label: "Aktif" },
            { value: "inactive", label: "Nonaktif" },
          ].map((o) => {
            // Warna badge untuk setiap status
            const statusColor =
              o.value === "active"
                ? "text-emerald-500"
                : o.value === "inactive"
                  ? "text-muted-foreground"
                  : "";

            const statusDotColor =
              o.value === "active"
                ? "bg-emerald-500"
                : o.value === "inactive"
                  ? "bg-gray-400"
                  : "";

            return (
              <SelectItem
                key={o.value}
                value={o.value}
                className={cn(
                  "text-foreground focus:bg-muted focus:text-foreground",
                  o.value !== "all" && statusColor,
                )}
              >
                {o.value !== "all" ? (
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("w-2 h-2 rounded-full", statusDotColor)}
                    />
                    {o.label}
                  </div>
                ) : (
                  o.label
                )}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
