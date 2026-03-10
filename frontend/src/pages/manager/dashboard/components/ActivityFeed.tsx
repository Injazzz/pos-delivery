import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "@/types/dashboard";
import { History, User, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  data?: ActivityLog[];
  isLoading: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  manager: "bg-heart-500",
  kasir: "bg-earth-500",
  kurir: "bg-glow-500",
  pelanggan: "bg-emerald-500",
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  manager: "bg-heart-500/20 text-heart-500 border-heart-500/30",
  kasir: "bg-earth-500/20 text-earth-500 border-earth-500/30",
  kurir: "bg-glow-500/20 text-glow-500 border-glow-500/30",
  pelanggan: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
};

export function ActivityFeed({ data, isLoading }: Props) {
  const navigate = useNavigate();

  // Batasi jumlah aktivitas yang ditampilkan di card
  const DISPLAY_LIMIT = 5;
  const displayData = data?.slice(0, DISPLAY_LIMIT) || [];
  const hasMoreData = (data?.length || 0) > DISPLAY_LIMIT;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
            <History className="w-4 h-4 text-heart-500" />
            Log Aktivitas
          </CardTitle>
          {data && data.length > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {data.length} aktivitas
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full bg-muted shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-3 w-1/2 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <History className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Belum ada aktivitas
            </p>
            <p className="text-xs text-muted-foreground">
              Log aktivitas akan muncul di sini
            </p>
          </div>
        ) : (
          <div>
            {displayData.map((log) => {
              const roleColor =
                ROLE_COLORS[log.causer_role ?? ""] ?? "bg-muted";
              const roleBadgeColor =
                ROLE_BADGE_COLORS[log.causer_role ?? ""] ??
                "bg-muted text-muted-foreground border-border";

              return (
                <div
                  key={log.id}
                  className={cn(
                    "flex gap-3 p-4 transition-all duration-200 border-b border-border last:border-0",
                    "hover:bg-muted/50 group",
                    "border-l-2 border-l-transparent hover:border-l-heart-500",
                  )}
                >
                  {/* Avatar/Icon dengan warna role */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      roleColor,
                      "bg-opacity-20 dark:bg-opacity-30",
                    )}
                  >
                    <User className="w-4 h-4 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {log.causer}
                      </span>
                      <span
                        className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-full border",
                          roleBadgeColor,
                        )}
                      >
                        {log.causer_role || "Unknown"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">
                      {log.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span title={log.created_at_full}>{log.created_at}</span>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="relative shrink-0 w-4 flex items-start justify-center">
                    <div
                      className={cn("w-2 h-2 rounded-full mt-2", roleColor)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Footer dengan link ke halaman activity logs */}
      {data && data.length > 0 && !isLoading && (
        <div className="border-t border-border p-3">
          {hasMoreData && (
            <p className="text-[10px] text-center text-muted-foreground mb-2">
              + {data.length - DISPLAY_LIMIT} aktivitas lainnya
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/manager/activity-logs")}
            className="w-full text-xs text-muted-foreground hover:text-heart-500 transition-colors flex items-center justify-center gap-1 h-8"
          >
            <span>Lihat semua aktivitas</span>
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      )}
    </Card>
  );
}
