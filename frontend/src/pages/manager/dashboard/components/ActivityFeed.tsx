import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "@/types/dashboard";

interface Props {
  data?: ActivityLog[];
  isLoading: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  manager: "bg-violet-500",
  kasir: "bg-blue-500",
  kurir: "bg-amber-500",
  pelanggan: "bg-emerald-500",
};

export function ActivityFeed({ data, isLoading }: Props) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm font-semibold">
          Log Aktivitas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-2 h-2 rounded-full bg-slate-800 mt-1 shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-3/4 bg-slate-800" />
                  <Skeleton className="h-3 w-1/3 bg-slate-800" />
                </div>
              </div>
            ))
          : (data ?? []).map((log) => (
              <div key={log.id} className="flex gap-3 group">
                <div className="flex flex-col items-center mt-1">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      ROLE_COLORS[log.causer_role ?? ""] ?? "bg-slate-600",
                    )}
                  />
                  <div className="w-px flex-1 bg-slate-800 mt-1 min-h-3" />
                </div>
                <div className="pb-3 min-w-0">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {log.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {log.causer}
                    </span>
                    <span className="text-[10px] text-slate-700">·</span>
                    <span
                      className="text-[10px] text-slate-600"
                      title={log.created_at_full}
                    >
                      {log.created_at}
                    </span>
                  </div>
                </div>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
