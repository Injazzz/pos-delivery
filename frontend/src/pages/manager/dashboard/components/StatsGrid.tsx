import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Banknote,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

interface Props {
  data?: DashboardSummary;
  isLoading: boolean;
}

function formatRupiah(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function StatsGrid({ data, isLoading }: Props) {
  const stats = [
    {
      label: "Pendapatan Bulan Ini",
      value: data ? formatRupiah(data.revenue.this_month) : "—",
      sub: data ? `Hari ini: ${formatRupiah(data.revenue.today)}` : "",
      growth: data?.revenue.growth,
      icon: Banknote,
      gradient: "from-amber-500/20 to-amber-500/5",
      iconBg: "bg-amber-500/20 text-amber-400",
    },
    {
      label: "Order Bulan Ini",
      value: data?.orders.this_month ?? "—",
      sub: data ? `Hari ini: ${data.orders.today} order` : "",
      growth: data?.orders.growth,
      icon: ShoppingBag,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconBg: "bg-blue-500/20 text-blue-400",
    },
    {
      label: "Total Pengguna",
      value: data?.users.total ?? "—",
      sub: data
        ? `${data.users.customers} pelanggan · ${data.users.couriers} kurir`
        : "",
      growth: null,
      icon: Users,
      gradient: "from-violet-500/20 to-violet-500/5",
      iconBg: "bg-violet-500/20 text-violet-400",
    },
    {
      label: "Menu Aktif",
      value: data?.menus.available ?? "—",
      sub: data ? `dari ${data.menus.total} total menu` : "",
      growth: null,
      icon: UtensilsCrossed,
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/20 text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={cn(
            "bg-linear-to-br border-slate-800 overflow-hidden",
            stat.gradient,
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  stat.iconBg,
                )}
              >
                <stat.icon className="w-4 h-4" />
              </div>
              {stat.growth !== null && stat.growth !== undefined && (
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full",
                    stat.growth >= 0
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400",
                  )}
                >
                  {stat.growth >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(stat.growth)}%
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-7 w-24 bg-slate-800" />
                <Skeleton className="h-3 w-32 bg-slate-800" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-white leading-none">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-1.5">{stat.sub}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {stat.label}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
