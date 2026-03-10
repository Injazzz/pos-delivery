import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Medal, TrendingUp, Package, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopMenu } from "@/types/report";

interface Props {
  data?: TopMenu[];
  isLoading: boolean;
}

// Warna untuk peringkat
const RANK_COLORS = [
  {
    text: "text-glow-500",
    bg: "bg-glow-500/10",
    border: "border-glow-500/30",
    icon: Star,
    label: "Terlaris",
  },
  {
    text: "text-gray-400",
    bg: "bg-gray-400/10",
    border: "border-gray-400/30",
    icon: Medal,
    label: "Peringkat 2",
  },
  {
    text: "text-earth-500",
    bg: "bg-earth-500/10",
    border: "border-earth-500/30",
    icon: Medal,
    label: "Peringkat 3",
  },
];

export function TopMenusTable({ data, isLoading }: Props) {
  const maxQty = data?.[0]?.total_qty ?? 1;
  const totalRevenue =
    data?.reduce((sum, menu) => sum + menu.total_revenue, 0) || 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-heart-500" />
            Menu Terlaris
          </CardTitle>
          {data && data.length > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {data.length} menu
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
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
                  <Skeleton className="h-4 w-16 bg-muted" />
                </div>
                <Skeleton className="h-1.5 w-full bg-muted" />
              </div>
            ))}
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Belum ada data menu
            </p>
            <p className="text-xs text-muted-foreground">
              Menu terlaris akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((menu, i) => {
              const rank = i < 3 ? RANK_COLORS[i] : null;
              const percentage = (menu.total_qty / maxQty) * 100;
              const RankIcon = rank?.icon || Medal;

              return (
                <div key={menu.menu_id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Rank indicator */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                        rank ? rank.bg : "bg-muted",
                      )}
                    >
                      {rank ? (
                        <RankIcon className={cn("w-3.5 h-3.5", rank.text)} />
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {i + 1}
                        </span>
                      )}
                    </div>

                    {/* Menu info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {menu.name}
                        </p>
                        <span
                          className={cn(
                            "text-[8px] px-1.5 py-0.5 rounded-full border shrink-0",
                            rank
                              ? `${rank.bg} ${rank.text} ${rank.border}`
                              : "bg-muted text-muted-foreground border-border",
                          )}
                        >
                          {menu.category}
                        </span>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {menu.total_qty} terjual
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          •
                        </span>
                        <span className="text-[10px] font-medium text-heart-500">
                          {formatCurrency(menu.total_revenue)}
                        </span>
                      </div>
                    </div>

                    {/* Percentage badge */}
                    <div className="shrink-0">
                      <span
                        className={cn(
                          "text-xs font-bold",
                          i === 0
                            ? "text-glow-500"
                            : i === 1
                              ? "text-gray-400"
                              : i === 2
                                ? "text-earth-500"
                                : "text-heart-500",
                        )}
                      >
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden ml-8">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        i === 0
                          ? "bg-glow-500"
                          : i === 1
                            ? "bg-gray-400"
                            : i === 2
                              ? "bg-earth-500"
                              : "bg-heart-500",
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Total summary */}
            <div className="pt-3 mt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Penjualan</span>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    {data.reduce((sum, m) => sum + m.total_qty, 0)} item
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer insight */}
      {data && data.length > 0 && !isLoading && (
        <div className="border-t border-border p-3 bg-muted/20">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Star className="w-3 h-3 text-glow-500 fill-glow-500" />
            <span>
              Menu terlaris:{" "}
              <span className="font-medium text-foreground">
                {data[0].name}
              </span>{" "}
              •
              {(
                (data[0].total_qty /
                  data.reduce((sum, m) => sum + m.total_qty, 0)) *
                100
              ).toFixed(1)}
              % dari total
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
