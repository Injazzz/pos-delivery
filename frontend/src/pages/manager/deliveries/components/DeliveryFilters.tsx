import { Search, Filter, X } from "lucide-react";
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
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onPageReset: () => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu Kurir", color: "text-glow-500" },
  { value: "assigned", label: "Kurir Ditugaskan", color: "text-heart-500" },
  { value: "picked_up", label: "Diambil", color: "text-earth-500" },
  { value: "on_way", label: "Dalam Perjalanan", color: "text-glow-500" },
  { value: "delivered", label: "Terkirim", color: "text-emerald-500" },
  { value: "failed", label: "Gagal", color: "text-destructive" },
];

// Helper untuk mendapatkan warna status
const getStatusColor = (statusValue: string) => {
  const status = STATUS_OPTIONS.find((s) => s.value === statusValue);
  return status?.color || "text-muted-foreground";
};

// Helper untuk mendapatkan background dot
const getStatusDotColor = (statusValue: string) => {
  const color = getStatusColor(statusValue);
  return color.replace("text", "bg");
};

export function DeliveryFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onPageReset,
}: Props) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    onPageReset();
  };

  const handleStatusChange = (value: string) => {
    onStatusChange(value);
    onPageReset();
  };

  const handleClear = () => {
    onSearchChange("");
    onStatusChange("all");
    onPageReset();
  };

  const isFilterActive = search !== "" || statusFilter !== "all";

  return (
    <div className="space-y-3">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode order..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 transition-all"
          />
        </div>

        {/* Filter Toggle - Mobile Only */}
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="sm:hidden border-border text-foreground hover:bg-muted hover:text-foreground gap-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filter Status</span>
          {statusFilter !== "all" && (
            <span className="ml-1 w-5 h-5 rounded-full bg-heart-500 text-white text-xs flex items-center justify-center">
              1
            </span>
          )}
        </Button>

        {/* Status Filter - Desktop */}
        <div className="hidden sm:block">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger
              className={cn(
                "w-48 bg-background border-border text-foreground hover:bg-muted/50",
                "focus:border-heart-500 focus:ring-heart-500/20 transition-all",
                statusFilter !== "all" && "border-heart-500/50",
              )}
            >
              <div className="flex items-center gap-2">
                {statusFilter !== "all" && (
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getStatusDotColor(statusFilter),
                    )}
                  />
                )}
                <SelectValue placeholder="Semua Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "focus:bg-muted focus:text-foreground",
                    opt.value !== "all" && opt.color,
                  )}
                >
                  <div className="flex items-center gap-2">
                    {opt.value !== "all" && (
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          opt.color?.replace("text", "bg"),
                        )}
                      />
                    )}
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {isFilterActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
          >
            <X className="w-4 h-4" />
            <span className="text-xs">Clear</span>
          </Button>
        )}
      </div>

      {/* Mobile Filters (Expandable) */}
      {showMobileFilters && (
        <div className="sm:hidden space-y-3 p-4 bg-muted/30 border border-border rounded-lg animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Filter Status</p>
            {statusFilter !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleStatusChange("all");
                  setShowMobileFilters(false);
                }}
                className="text-muted-foreground hover:text-foreground h-8"
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>

          {/* Status Options Mobile */}
          <div className="space-y-1">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  handleStatusChange(opt.value);
                  setShowMobileFilters(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  statusFilter === opt.value
                    ? "bg-heart-500/10 text-heart-500"
                    : "hover:bg-muted text-foreground",
                )}
              >
                {opt.value !== "all" && (
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      opt.color?.replace("text", "bg"),
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-sm flex-1",
                    statusFilter === opt.value ? "font-medium" : "",
                  )}
                >
                  {opt.label}
                </span>
                {statusFilter === opt.value && (
                  <span className="text-heart-500 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Indicator */}
      {isFilterActive && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="w-3 h-3" />
          <span>Filter aktif:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {search && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-foreground">
                Pencarian: {search}
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-foreground">
                Status:{" "}
                {STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
