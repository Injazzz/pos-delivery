import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ordersApi } from "@/api/orders";
import { OrderCard } from "./components/OrderCard";
import { OrderDetailDialog } from "./components/OrderDetailDialog";
import { ReviewDialog } from "./components/ReviewDialog";
import type { Order } from "@/types/order";

const TABS = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "cooking", label: "Dimasak" },
  { value: "on_delivery", label: "Dikirim" },
  { value: "delivered", label: "Selesai" },
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Pesanan Saya</h1>
        <p className="text-slate-400 text-sm mt-1">
          Riwayat dan status pesanan Anda
        </p>
      </div>

      <Tabs value={activeStatus} onValueChange={setActiveStatus}>
        <TabsList className="bg-slate-900 border border-slate-800 h-9 p-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:font-semibold text-slate-400"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="mt-4 space-y-3"
          >
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 bg-slate-800 rounded-xl" />
              ))}
            {!isLoading && (data?.data ?? []).length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
                <ClipboardList className="w-8 h-8" />
                <p className="text-sm">Belum ada pesanan</p>
              </div>
            )}
            {!isLoading &&
              (data?.data ?? []).map((order) => (
                <OrderCard key={order.id} order={order} onView={setViewOrder} />
              ))}
          </TabsContent>
        ))}
      </Tabs>

      <OrderDetailDialog
        order={viewOrder}
        onClose={() => setViewOrder(null)}
        onReview={handleReview}
      />

      <ReviewDialog order={reviewOrder} onClose={() => setReviewOrder(null)} />
    </div>
  );
}
