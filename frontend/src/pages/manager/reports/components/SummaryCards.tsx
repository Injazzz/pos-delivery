import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  BarChart2,
  Receipt,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReportSummary } from "@/types/report";

function fmt(n: number) {
  return `Rp ${n.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

interface Props {
  data?: ReportSummary;
  isLoading: boolean;
}

export function SummaryCards({ data, isLoading }: Props) {
  const growth = data?.revenue_growth;
  const completedOrders =
    (data?.orders_by_status?.completed ?? 0) +
    (data?.orders_by_status?.delivered ?? 0);

  const cards = [
    {
      label: "Pendapatan Lunas",
      value: data ? fmt(data.revenue) : "-",
      icon: Receipt,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      valueColor: "text-emerald-500",
      extra:
        growth !== null && growth !== undefined ? (
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium mt-1",
              growth >= 0 ? "text-emerald-500" : "text-destructive",
            )}
          >
            {growth >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(growth)}% vs periode lalu
          </div>
        ) : null,
    },
    {
      label: "Pendapatan Tertunda",
      value: data ? fmt(data.revenue_pending) : "-",
      icon: Receipt,
      iconBg: "bg-glow-500/10",
      iconColor: "text-glow-500",
      valueColor: "text-glow-500",
      extra: data ? (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
          <Clock className="w-3 h-3" />
          <span>{data.orders_partial} order dengan DP</span>
        </div>
      ) : null,
    },
    {
      label: "Total Order",
      value: data?.orders_count.toLocaleString("id-ID") ?? "-",
      icon: ShoppingBag,
      iconBg: "bg-heart-500/10",
      iconColor: "text-heart-500",
      valueColor: "text-heart-500",
      extra: data ? (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>{data.orders_paid}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-glow-500" />
            <span>{data.orders_partial}</span>
          </div>
        </div>
      ) : null,
    },
    {
      label: "Rata-rata Order",
      value: data ? fmt(data.avg_order_value) : "-",
      icon: BarChart2,
      iconBg: "bg-earth-500/10",
      iconColor: "text-earth-500",
      valueColor: "text-earth-500",
      extra: data ? (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
          <Calendar className="w-3 h-3" />
          <span>Per transaksi</span>
        </div>
      ) : null,
    },
    {
      label: "Order Selesai",
      value: completedOrders.toLocaleString("id-ID"),
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      valueColor: "text-emerald-500",
      extra: data ? (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
          <CheckCircle className="w-3 h-3" />
          <span>
            {((completedOrders / data.orders_count) * 100).toFixed(1)}% dari
            total
          </span>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <Card
          key={c.label}
          className="bg-card border-border overflow-hidden hover:shadow-md hover:shadow-heart-500/5 transition-all group"
        >
          <CardContent className="p-4">
            {/* Header with icon */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                  c.iconBg,
                )}
              >
                <c.icon className={cn("w-4 h-4", c.iconColor)} />
              </div>
            </div>

            {/* Value */}
            {isLoading ? (
              <Skeleton className="h-7 w-24 bg-muted" />
            ) : (
              <p className={cn("text-xl font-bold", c.valueColor)}>{c.value}</p>
            )}

            {/* Extra info */}
            {c.extra && !isLoading && c.extra}

            {/* Mini progress bar untuk beberapa card (optional) */}
            {c.label === "Order Selesai" && data && (
              <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedOrders / data.orders_count) * 100}%`,
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
