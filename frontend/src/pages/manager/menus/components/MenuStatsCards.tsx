import {
  UtensilsCrossed,
  CheckCircle,
  XCircle,
  LayoutGrid,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Summary {
  total: number;
  available: number;
  unavailable: number;
  categories: number;
}

const STATS = [
  {
    key: "total",
    label: "Total Menu",
    icon: UtensilsCrossed,
    iconBg: "bg-heart-500/10",
    iconColor: "text-heart-500",
    valueColor: "text-foreground",
    get: (s: Summary) => s.total,
  },
  {
    key: "available",
    label: "Tersedia",
    icon: CheckCircle,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    valueColor: "text-emerald-500",
    get: (s: Summary) => s.available,
  },
  {
    key: "unavailable",
    label: "Tidak Tersedia",
    icon: XCircle,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    valueColor: "text-destructive",
    get: (s: Summary) => s.unavailable,
  },
  {
    key: "categories",
    label: "Kategori",
    icon: LayoutGrid,
    iconBg: "bg-glow-500/10",
    iconColor: "text-glow-500",
    valueColor: "text-glow-500",
    get: (s: Summary) => s.categories,
  },
];

export function MenuStatsCards({
  summary,
  isLoading,
}: {
  summary?: Summary;
  isLoading: boolean;
}) {
  // Hitung persentase ketersediaan
  const availabilityPercentage = summary?.total
    ? Math.round((summary.available / summary.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map((s) => (
        <Card
          key={s.key}
          className="bg-card border-border overflow-hidden hover:shadow-md hover:shadow-heart-500/5 transition-all group"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Icon dengan background - ukuran lebih kecil */}
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                  s.iconBg,
                )}
              >
                <s.icon className={cn("w-4 h-4", s.iconColor)} />
              </div>

              {/* Value */}
              <div className="text-right">
                {isLoading ? (
                  <Skeleton className="h-5 w-10 bg-muted" />
                ) : (
                  <p
                    className={cn(
                      "text-lg font-bold leading-none",
                      s.valueColor,
                    )}
                  >
                    {summary ? s.get(summary) : 0}
                  </p>
                )}
              </div>
            </div>

            {/* Label dan info tambahan */}
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>

              {/* Trend indicator untuk total menu - lebih kecil */}
              {s.key === "total" && summary && summary.total > 0 && (
                <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>{availabilityPercentage}%</span>
                </div>
              )}
            </div>

            {/* Progress bar tipis untuk available */}
            {s.key === "available" && summary && summary.total > 0 && (
              <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
