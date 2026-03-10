import { Search, Calendar, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  orderType: string;
  setOrderType: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
}

const STATUSES = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu", color: "text-glow-500" },
  { value: "processing", label: "Diproses", color: "text-heart-400" },
  { value: "cooking", label: "Dimasak", color: "text-earth-500" },
  { value: "ready", label: "Siap", color: "text-emerald-500" },
  { value: "on_delivery", label: "Dikirim", color: "text-glow-500" },
  { value: "delivered", label: "Diterima", color: "text-emerald-500" },
  { value: "cancelled", label: "Dibatalkan", color: "text-destructive" },
];

const TYPES = [
  { value: "all", label: "Semua Tipe" },
  { value: "dine_in", label: "Dine In", icon: "", color: "text-earth-500" },
  {
    value: "take_away",
    label: "Take Away",
    icon: "",
    color: "text-heart-500",
  },
  { value: "delivery", label: "Delivery", icon: "", color: "text-glow-500" },
];

// Helper untuk mendapatkan warna status
const getStatusColor = (statusValue: string) => {
  const status = STATUSES.find((s) => s.value === statusValue);
  return status?.color || "text-muted-foreground";
};

export function OrderFilters({
  search,
  setSearch,
  status,
  setStatus,
  orderType,
  setOrderType,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);

  // Hitung jumlah filter aktif
  const activeFiltersCount = [
    status !== "all",
    orderType !== "all",
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setStatus("all");
    setOrderType("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-3">
      {/* Search bar and filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 transition-all"
          />
        </div>

        {/* Filter toggle button untuk mobile */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden border-border text-foreground hover:bg-muted hover:text-foreground gap-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-heart-500 text-white text-xs flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Desktop filters */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Status filter */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              className={cn(
                "w-40 bg-background border-border text-foreground hover:bg-muted/50",
                "focus:border-heart-500 focus:ring-heart-500/20 transition-all",
                status !== "all" && "border-heart-500/50",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    status === "all"
                      ? "bg-muted-foreground"
                      : getStatusColor(status),
                  )}
                />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {STATUSES.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  className={cn(
                    "focus:bg-muted focus:text-foreground",
                    s.value !== "all" && (s.color ?? "text-muted-foreground"),
                  )}
                >
                  <div className="flex items-center gap-2">
                    {s.value !== "all" && (
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          (s.color ?? "text-muted-foreground").replace(
                            "text",
                            "bg",
                          ),
                        )}
                      />
                    )}
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Order type filter */}
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger
              className={cn(
                "w-40 bg-background border-border text-foreground hover:bg-muted/50",
                "focus:border-heart-500 focus:ring-heart-500/20 transition-all",
                orderType !== "all" && "border-heart-500/50",
              )}
            >
              <SelectValue placeholder="Tipe Order" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {TYPES.map((t) => (
                <SelectItem
                  key={t.value}
                  value={t.value}
                  className={cn(
                    "focus:bg-muted focus:text-foreground",
                    t.value !== "all" && (t.color ?? "text-muted-foreground"),
                  )}
                >
                  <div className="flex items-center gap-2">
                    {t.value !== "all" && (
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          (t.color ?? "text-muted-foreground").replace(
                            "text",
                            "bg",
                          ),
                        )}
                      />
                    )}
                    <span>{t.icon && t.value !== "all" ? t.icon : ""}</span>
                    <span>{t.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range */}
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1">
            <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 w-32 text-xs bg-transparent border-0 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              placeholder="Dari"
            />
            <span className="text-muted-foreground text-xs">-</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 w-32 text-xs bg-transparent border-0 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              placeholder="Sampai"
            />
          </div>

          {/* Clear filters button */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
            >
              <X className="w-4 h-4" />
              <span className="text-xs">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile filters (expandable) */}
      {showFilters && (
        <div className="sm:hidden space-y-3 p-4 bg-muted/30 border border-border rounded-lg animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Filter</p>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground h-8"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Status filter mobile */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full bg-background border-border text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value} className={s.color}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Order type filter mobile */}
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger className="w-full bg-background border-border text-foreground">
              <SelectValue placeholder="Tipe Order" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value} className={t.color}>
                  {t.icon} {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range mobile */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Rentang Tanggal</p>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 bg-background border-border text-foreground text-xs"
                placeholder="Dari"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 bg-background border-border text-foreground text-xs"
                placeholder="Sampai"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active filters indicator */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="w-3 h-3" />
          <span>Filter aktif:</span>
          <div className="flex items-center gap-1">
            {status !== "all" && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-foreground">
                Status: {STATUSES.find((s) => s.value === status)?.label}
              </span>
            )}
            {orderType !== "all" && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-foreground">
                Tipe: {TYPES.find((t) => t.value === orderType)?.label}
              </span>
            )}
            {(dateFrom || dateTo) && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-foreground">
                {dateFrom || "..."} - {dateTo || "..."}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
