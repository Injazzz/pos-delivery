/* eslint-disable @typescript-eslint/no-explicit-any */

import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportFilters, ReportPeriod } from "@/types/report";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "week", label: "Minggu Ini" },
  { value: "month", label: "Bulan Ini" },
  { value: "year", label: "Tahun Ini" },
  { value: "custom", label: "Custom" },
];

interface Props {
  filters: ReportFilters;
  onChange: (f: ReportFilters) => void;
  isLoading: boolean;
}

export function ReportFilters({ filters, onChange, isLoading }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-lg p-3">
      {/* Period tabs */}
      <div className="flex bg-muted/50 rounded-lg p-1 gap-0.5 border border-border">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange({ ...filters, period: p.value })}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              filters.period === p.value
                ? "bg-heart-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {filters.period === "custom" && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="date"
              value={filters.from ?? ""}
              onChange={(e) => onChange({ ...filters, from: e.target.value })}
              className="h-8 w-36 pl-8 text-xs bg-background border-border text-foreground"
            />
          </div>
          <span className="text-muted-foreground text-xs">s/d</span>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="date"
              value={filters.to ?? ""}
              onChange={(e) => onChange({ ...filters, to: e.target.value })}
              className="h-8 w-36 pl-8 text-xs bg-background border-border text-foreground"
            />
          </div>
        </div>
      )}

      {/* Group by */}
      {(filters.period === "month" ||
        filters.period === "year" ||
        filters.period === "custom") && (
        <select
          value={filters.group_by ?? "day"}
          onChange={(e) =>
            onChange({ ...filters, group_by: e.target.value as any })
          }
          className="h-8 text-xs bg-background border border-border text-foreground rounded-md px-2 focus:border-heart-500 focus:ring-1 focus:ring-heart-500/20 outline-none"
        >
          <option value="day">Per Hari</option>
          <option value="week">Per Minggu</option>
          <option value="month">Per Bulan</option>
        </select>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-3.5 h-3.5 border-2 border-heart-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] text-muted-foreground">Loading...</span>
        </div>
      )}
    </div>
  );
}
