/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "@/types/report";

const ROLE_COLORS: Record<string, string> = {
  manager: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  kasir: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  kurir: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  pelanggan: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

interface Props {
  logs: ActivityLog[];
  isLoading: boolean;
  meta?: any;
  onPageChange: (page: number) => void;
}

export function LogTable({ logs, isLoading, meta, onPageChange }: Props) {
  return (
    <div className="space-y-2">
      {isLoading &&
        Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 bg-slate-800 rounded-xl" />
        ))}

      {!isLoading &&
        logs.map((log) => (
          <div
            key={log.id}
            className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Role dot */}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0 mt-1.5",
                    log.causer?.role === "manager"
                      ? "bg-violet-500"
                      : log.causer?.role === "kasir"
                        ? "bg-blue-500"
                        : log.causer?.role === "kurir"
                          ? "bg-amber-500"
                          : "bg-slate-500",
                  )}
                />

                <div className="min-w-0">
                  <p className="text-sm text-white leading-tight">
                    {log.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {log.causer && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          ROLE_COLORS[log.causer.role] ??
                            "bg-slate-500/15 text-slate-400",
                        )}
                      >
                        {log.causer.name}
                      </Badge>
                    )}
                    {log.subject_type && (
                      <span className="text-[10px] text-slate-600">
                        {log.subject_type} #{log.subject_id}
                      </span>
                    )}
                    {log.log_name && (
                      <span className="text-[10px] text-slate-600 italic">
                        {log.log_name}
                      </span>
                    )}
                  </div>

                  {/* Properties (collapsible) */}
                  {Object.keys(log.properties).length > 0 && (
                    <details className="mt-1">
                      <summary className="text-[10px] text-slate-600 cursor-pointer hover:text-slate-400">
                        Lihat detail
                      </summary>
                      <pre className="text-[10px] text-slate-500 mt-1 bg-slate-800 rounded p-2 overflow-x-auto">
                        {JSON.stringify(log.properties, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              <span className="text-[10px] text-slate-600 shrink-0 text-right">
                {new Date(log.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

      {!isLoading && logs.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          Tidak ada activity log
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            {meta.from}–{meta.to} dari {meta.total}
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
            <span className="text-xs px-3 py-1 bg-slate-800 rounded-md border border-slate-700 text-white">
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
