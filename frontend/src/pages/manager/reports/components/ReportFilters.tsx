/* eslint-disable @typescript-eslint/no-explicit-any */

import { Input } from "@/components/ui/input";
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
    <div className="flex flex-wrap items-center gap-2">
      {/* Period tabs */}
      <div className="flex bg-slate-800 rounded-xl p-1 gap-0.5">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange({ ...filters, period: p.value })}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filters.period === p.value
                ? "bg-amber-500 text-slate-950 shadow font-bold"
                : "text-slate-400 hover:text-white",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {filters.period === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filters.from ?? ""}
            onChange={(e) => onChange({ ...filters, from: e.target.value })}
            className="h-8 w-36 text-xs bg-slate-800 border-slate-700 text-white"
          />
          <span className="text-slate-500 text-xs">s/d</span>
          <Input
            type="date"
            value={filters.to ?? ""}
            onChange={(e) => onChange({ ...filters, to: e.target.value })}
            className="h-8 w-36 text-xs bg-slate-800 border-slate-700 text-white"
          />
        </div>
      )}

      {/* Group by (untuk chart) */}
      {(filters.period === "month" ||
        filters.period === "year" ||
        filters.period === "custom") && (
        <select
          value={filters.group_by ?? "day"}
          onChange={(e) =>
            onChange({ ...filters, group_by: e.target.value as any })
          }
          className="h-8 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2"
        >
          <option value="day">Per Hari</option>
          <option value="week">Per Minggu</option>
          <option value="month">Per Bulan</option>
        </select>
      )}

      {isLoading && (
        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin ml-1" />
      )}
    </div>
  );
}
