/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { ReprintDialog } from "@/components/print/ReprintDialog";
import { useDebounce } from "@/hooks/useDebounce";
import apiClient from "@/lib/axios";
import { ReceiptSkeleton } from "./components/ReceiptSkeleton";
import { ReceiptEmptyState } from "./components/ReceiptEmptyState";
import { ReceiptOrderCard } from "./components/ReceiptOrderCard";
import { ReceiptFooter } from "./components/ReceiptFooter";
import { ReceiptSearch } from "./components/ReceiptSearch";

export default function ManagerReceiptsPage() {
  const [search, setSearch] = useState("");
  const [reprint, setReprint] = useState<number | null>(null);

  const debounced = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["manager-orders-receipt", debounced],
    queryFn: () =>
      apiClient
        .get("/manager/orders", {
          params: {
            search: debounced || undefined,
            status: "completed,delivered,cancelled",
            per_page: 20,
          },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const orders = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Printer className="w-6 h-6 text-amber-400" />
          Cetak Ulang Struk
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cari order dan cetak ulang struk pelanggan atau dapur
        </p>
      </div>

      <ReceiptSearch value={search} onChange={setSearch} />

      <div className="space-y-3">
        {/* Header - Desktop */}
        <div className="hidden lg:grid grid-cols-[1fr,1fr,120px,100px] gap-4 px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium border-b border-border">
          <span>Order</span>
          <span>Pelanggan</span>
          <span>Status</span>
          <span className="text-right">Aksi</span>
        </div>

        {/* Content */}
        {isLoading ? (
          <ReceiptSkeleton />
        ) : orders.length === 0 ? (
          <ReceiptEmptyState />
        ) : (
          <>
            {orders.map((order: any) => (
              <ReceiptOrderCard
                key={order.id}
                order={order}
                onPrint={setReprint}
              />
            ))}
            <ReceiptFooter totalOrders={orders.length} />
          </>
        )}
      </div>

      <ReprintDialog orderId={reprint} onClose={() => setReprint(null)} />
    </div>
  );
}
