import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { TopMenu } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { TrendingUp, Flame, Crown, Medal } from "lucide-react";

interface Props {
  data?: TopMenu[];
  isLoading: boolean;
}

// Icon untuk peringkat
const RANK_ICONS = [
  { icon: Crown, color: "text-glow-500", bg: "bg-glow-500/20" },
  { icon: Medal, color: "text-gray-400", bg: "bg-gray-400/20" },
  { icon: Medal, color: "text-earth-500", bg: "bg-earth-500/20" },
];

export function TopMenusCard({ data, isLoading }: Props) {
  const maxQty = Math.max(...(data?.map((m) => m.total_qty) ?? [1])) || 1;

  // Format angka
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-heart-500" />
            Menu Terlaris — 30 Hari
          </CardTitle>
          {data && data.length > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] border-border bg-muted text-muted-foreground"
            >
              Total {data.length} menu
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full bg-muted" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 bg-muted mb-1" />
                    <Skeleton className="h-3 w-1/4 bg-muted" />
                  </div>
                  <Skeleton className="h-4 w-12 bg-muted" />
                </div>
                <Skeleton className="h-2 w-full bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <Flame className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Belum ada data
            </p>
            <p className="text-xs text-muted-foreground">
              Menu terlaris akan muncul di sini
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 highlighted */}
            {data.slice(0, Math.min(3, data.length)).map((menu, i) => {
              const RankIcon = RANK_ICONS[i]?.icon || Medal;
              const percentage = (menu.total_qty / maxQty) * 100;

              return (
                <div key={menu.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Rank icon */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                        RANK_ICONS[i]?.bg || "bg-muted",
                      )}
                    >
                      <RankIcon
                        className={cn(
                          "w-3.5 h-3.5",
                          RANK_ICONS[i]?.color || "text-muted-foreground",
                        )}
                      />
                    </div>

                    {/* Menu info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {menu.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0 h-4 bg-muted text-muted-foreground shrink-0"
                        >
                          {menu.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          Terjual
                        </span>
                        <span className="text-xs font-bold text-heart-500">
                          {formatNumber(menu.total_qty)}x
                        </span>
                      </div>
                    </div>

                    {/* Rank number */}
                    <div className="shrink-0">
                      <span
                        className={cn(
                          "text-xs font-bold px-1.5 py-0.5 rounded",
                          i === 0
                            ? "bg-glow-500/20 text-glow-600"
                            : i === 1
                              ? "bg-gray-400/20 text-gray-500"
                              : "bg-earth-500/20 text-earth-600",
                        )}
                      >
                        #{i + 1}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar with gradient */}
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percentage}%`,
                        background:
                          i === 0
                            ? "linear-gradient(to right, var(--glow-500), var(--glow-400))"
                            : i === 1
                              ? "linear-gradient(to right, var(--gray-400), var(--gray-300))"
                              : "linear-gradient(to right, var(--earth-500), var(--earth-400))",
                      }}
                    >
                      {/* Shimmer effect */}
                      <div
                        className="absolute inset-0 shimmer"
                        style={{
                          background:
                            "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Separator */}
            {data.length > 3 && (
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-[10px] text-muted-foreground">
                    Menu Lainnya
                  </span>
                </div>
              </div>
            )}

            {/* Remaining items */}
            {data.slice(3).map((menu, i) => {
              const actualIndex = i + 3;
              const percentage = (menu.total_qty / maxQty) * 100;

              return (
                <div key={menu.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">
                        #{actualIndex}
                      </span>
                      <span className="text-xs text-foreground truncate">
                        {menu.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[8px] px-1 py-0 h-4 border-border text-muted-foreground shrink-0"
                      >
                        {menu.category}
                      </Badge>
                    </div>
                    <span className="text-xs font-semibold text-earth-500 shrink-0">
                      {formatNumber(menu.total_qty)}x
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background:
                          "linear-gradient(to right, var(--heart-500), var(--heart-400))",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
