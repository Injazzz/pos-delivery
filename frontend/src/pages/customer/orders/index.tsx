import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Package,
  Clock,
  CheckCircle,
  Truck,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ordersApi } from "@/api/orders";
import { OrderCard } from "./components/OrderCard";
import { OrderDetailDialog } from "./components/OrderDetailDialog";
import { ReviewDialog } from "./components/ReviewDialog";
import type { Order } from "@/types/order";

const TABS = [
  {
    value: "all",
    label: "Semua",
    icon: Package,
    color: "text-muted-foreground",
  },
  { value: "pending", label: "Menunggu", icon: Clock, color: "text-glow-500" },
  {
    value: "cooking",
    label: "Dimasak",
    icon: ChefHat,
    color: "text-earth-500",
  },
  {
    value: "on_delivery",
    label: "Dikirim",
    icon: Truck,
    color: "text-glow-500",
  },
  {
    value: "delivered",
    label: "Selesai",
    icon: CheckCircle,
    color: "text-emerald-500",
  },
];

export default function CustomerOrders() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customer-orders", activeStatus],
    queryFn: () =>
      ordersApi
        .customerOrders({
          status: activeStatus === "all" ? undefined : activeStatus,
          per_page: 20,
        })
        .then((r) => r.data),
  });

  const handleReview = (order: Order) => {
    setViewOrder(null);
    setTimeout(() => setReviewOrder(order), 100);
  };

  const orders = data?.data ?? [];
  const totalOrders = data?.meta?.total || 0;

  // Hitung jumlah per status untuk badge
  const counts = {
    all: totalOrders,
    pending: orders.filter((o: Order) => o.status === "pending").length,
    cooking: orders.filter((o: Order) => o.status === "cooking").length,
    on_delivery: orders.filter((o: Order) => o.status === "on_delivery").length,
    delivered: orders.filter((o: Order) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-heart-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-heart-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pesanan Saya</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Riwayat dan status pesanan Anda
            </p>
          </div>
        </div>

        {activeStatus !== "all" && (
          <Badge
            variant="outline"
            className="bg-muted text-foreground border-border gap-1"
          >
            {TABS.find((t) => t.value === activeStatus)?.label}
            <button
              onClick={() => setActiveStatus("all")}
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeStatus} onValueChange={setActiveStatus}>
        <TabsList className="bg-card border border-border h-auto p-1 w-full overflow-x-auto flex-nowrap justify-start scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStatus === tab.value;
            const count = counts[tab.value as keyof typeof counts] || 0;

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs data-[state=active]:bg-heart-500/10 data-[state=active]:text-heart-500 whitespace-nowrap",
                  "transition-all duration-200",
                  isActive && "shadow-sm",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-heart-500" : "text-muted-foreground",
                  )}
                />
                <span className="font-medium">{tab.label}</span>
                {count > 0 && (
                  <Badge
                    className={cn(
                      "ml-1 text-[8px] px-1.5 min-w-4.5 h-4.5",
                      isActive
                        ? "bg-heart-500 text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="mt-4 space-y-3"
          >
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-24 bg-muted rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && orders.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-16 px-4 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <ClipboardList className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {tab.value === "all"
                      ? "Belum ada pesanan"
                      : `Tidak ada pesanan dengan status ${tab.label.toLowerCase()}`}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-50">
                    {tab.value === "all"
                      ? "Pesanan Anda akan muncul di sini"
                      : "Coba cek status lainnya"}
                  </p>
                </div>
              </div>
            )}

            {/* Orders List */}
            {!isLoading && orders.length > 0 && (
              <div className="space-y-3">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onView={setViewOrder}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Order Summary Footer (jika ada pesanan) */}
      {!isLoading && orders.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4 mt-2">
          <span>Menampilkan {orders.length} pesanan</span>
          {data?.meta && (
            <span>
              Halaman {data.meta.current_page} dari {data.meta.last_page}
            </span>
          )}
        </div>
      )}

      <OrderDetailDialog
        order={viewOrder}
        onClose={() => setViewOrder(null)}
        onReview={handleReview}
      />

      <ReviewDialog order={reviewOrder} onClose={() => setReviewOrder(null)} />
    </div>
  );
}

// Import ChefHat
import { ChefHat } from "lucide-react";
