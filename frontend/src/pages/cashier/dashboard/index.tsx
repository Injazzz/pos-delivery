import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, ChefHat, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { ordersApi } from "@/api/orders";
import { LiveBadge } from "@/components/shared/LiveBagde";
import { RealtimeOrderFeed } from "@/components/shared/RealtimeOrderFeed";

export default function CashierDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["cashier-orders-dashboard"],
    queryFn: () =>
      ordersApi.cashierOrders({ per_page: 10, page: 1 }).then((r) => r.data),
    refetchInterval: 15_000, // auto-refresh setiap 15 detik
  });

  const stats = data?.stats;
  const orders = data?.data ?? [];

  const STAT_CARDS = [
    {
      label: "Order Hari Ini",
      value: stats?.today_orders ?? 0,
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      label: "Menunggu",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "text-yellow-400",
    },
    {
      label: "Diproses",
      value: stats?.processing ?? 0,
      icon: ChefHat,
      color: "text-orange-400",
    },
    {
      label: "Siap",
      value: stats?.ready ?? 0,
      icon: CheckCircle,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Kasir</h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor pesanan masuk secara real-time
          </p>
        </div>
        <LiveBadge />
        <Button
          onClick={() => navigate("/cashier/new-order")}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold gap-2"
        >
          <Plus className="w-4 h-4" /> Pesanan Baru
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map((s) => (
          <Card key={s.label} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-6 w-8 bg-slate-800" />
                ) : (
                  <p className="text-xl font-bold text-white">{s.value}</p>
                )}
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <RealtimeOrderFeed />

      {/* Recent orders */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Pesanan Terbaru
        </h2>
        <div className="space-y-2">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 bg-slate-800 rounded-xl" />
            ))}
          {!isLoading &&
            orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition-colors cursor-pointer"
                onClick={() => navigate(`/cashier/payment/${order.id}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {order.order_code}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.customer?.name ?? "Walk-in"} ·{" "}
                      {order.items?.length ?? 0} item
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-amber-400">
                    {order.formatted_total}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
