import {
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  const cards = [
    {
      label: "Order Hari Ini",
      value: stats?.today_orders,
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      label: "Menunggu",
      value: stats?.pending,
      icon: Clock,
      color: "text-yellow-400",
    },
    {
      label: "Diproses",
      value: stats?.processing,
      icon: ChefHat,
      color: "text-orange-400",
    },
    {
      label: "Siap Ambil",
      value: stats?.ready,
      icon: CheckCircle,
      color: "text-emerald-400",
    },
    {
      label: "Revenue Hari Ini",
      value:
        stats?.today_revenue != null
          ? `Rp ${(stats.today_revenue / 1000).toFixed(0)}rb`
          : "-",
      icon: ShoppingBag,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="bg-slate-900 border-slate-800">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className="min-w-0">
              {isLoading ? (
                <Skeleton className="h-5 w-10 bg-slate-800" />
              ) : (
                <p className="text-base font-bold text-white leading-none">
                  {c.value ?? 0}
                </p>
              )}
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                {c.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
