import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  BarChart2,
  Receipt,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReportSummary } from "@/types/report";

function fmt(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

interface Props {
  data?: ReportSummary;
  isLoading: boolean;
}

export function SummaryCards({ data, isLoading }: Props) {
  const growth = data?.revenue_growth;

  const cards = [
    {
      label: "Total Pendapatan",
      value: data ? fmt(data.revenue) : "-",
      icon: Receipt,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      extra:
        growth !== null && growth !== undefined ? (
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium",
              growth >= 0 ? "text-emerald-400" : "text-red-400",
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
      label: "Total Order",
      value: data?.orders_count.toLocaleString("id-ID") ?? "-",
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      extra: null,
    },
    {
      label: "Rata-rata Order",
      value: data ? fmt(data.avg_order_value) : "-",
      icon: BarChart2,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      extra: null,
    },
    {
      label: "Order Selesai",
      value: data
        ? (
            (data.orders_by_status["completed"] ?? 0) +
            (data.orders_by_status["delivered"] ?? 0)
          ).toLocaleString("id-ID")
        : "-",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      extra: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500">{c.label}</p>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  c.bg,
                )}
              >
                <c.icon className={cn("w-4 h-4", c.color)} />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-24 bg-slate-800" />
            ) : (
              <p className="text-xl font-bold text-white">{c.value}</p>
            )}
            {c.extra && !isLoading && <div className="mt-1">{c.extra}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
