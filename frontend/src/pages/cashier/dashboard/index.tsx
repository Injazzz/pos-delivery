import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ordersApi } from "@/api/orders";
import { RealtimeOrderFeed } from "@/components/shared/RealtimeOrderFeed";
import { StatsCards } from "./components/StatsCard";
import { RecentOrdersList } from "./components/RecentOrderList";

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

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          {" "}
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-heart-500" />
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard Kasir
            </h1>
          </div>{" "}
          <p className="text-muted-foreground text-sm mt-1">
            Monitor pesanan masuk secara real-time
          </p>
        </div>

        <Button
          onClick={() => navigate("/cashier/new-order")}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold gap-2"
        >
          <Plus className="w-4 h-4" /> Pesanan Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* Real-time Order Feed */}
      <RealtimeOrderFeed />

      {/* Recent Orders Section */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Pesanan Terbaru
        </h2>
        <RecentOrdersList orders={orders} isLoading={isLoading} />
      </div>
    </div>
  );
}
