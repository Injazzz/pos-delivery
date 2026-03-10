import {
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Stats {
  today_orders: number;
  today_revenue: number;
  pending: number;
  processing: number;
  ready: number;
}

interface Props {
  stats?: Stats;
  isLoading: boolean;
}

export function OrderStatsBar({ stats, isLoading }: Props) {
  // Format revenue
  const formatRevenue = (revenue: number) => {
    if (revenue >= 1000000) {
      return `Rp ${(revenue / 1000000).toFixed(1)}jt`;
    } else if (revenue >= 1000) {
      return `Rp ${(revenue / 1000).toFixed(0)}rb`;
    }
    return `Rp ${revenue}`;
  };

  const cards = [
    {
      label: "Order Hari Ini",
      value: stats?.today_orders ?? 0,
      icon: TrendingUp,
      iconBg: "bg-heart-500/10",
      iconColor: "text-heart-500",
      valueColor: "text-foreground",
    },
    {
      label: "Menunggu",
      value: stats?.pending ?? 0,
      icon: Clock,
      iconBg: "bg-glow-500/10",
      iconColor: "text-glow-500",
      valueColor: "text-glow-500",
    },
    {
      label: "Diproses",
      value: stats?.processing ?? 0,
      icon: ChefHat,
      iconBg: "bg-earth-500/10",
      iconColor: "text-earth-500",
      valueColor: "text-earth-500",
    },
    {
      label: "Siap Ambil",
      value: stats?.ready ?? 0,
      icon: CheckCircle,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      valueColor: "text-emerald-500",
    },
    {
      label: "Revenue Hari Ini",
      value: stats?.today_revenue ? formatRevenue(stats.today_revenue) : "Rp 0",
      icon: ShoppingBag,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      valueColor: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <Card
          key={c.label}
          className="bg-card border-border overflow-hidden hover:shadow-md hover:shadow-heart-500/5 transition-all group"
        >
          <CardContent className="p-3 flex items-center gap-3">
            {/* Icon dengan background */}
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                c.iconBg,
              )}
            >
              <c.icon className={cn("w-4 h-4", c.iconColor)} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-5 w-12 bg-muted mb-1" />
                  <Skeleton className="h-3 w-16 bg-muted" />
                </>
              ) : (
                <>
                  <p
                    className={cn(
                      "text-base font-bold leading-none",
                      c.valueColor,
                    )}
                  >
                    {c.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">
                    {c.label}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
