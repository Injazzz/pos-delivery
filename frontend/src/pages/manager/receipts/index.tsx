/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { ReprintDialog } from "@/components/print/ReprintDialog";
import { useDebounce } from "@/hooks/useDebounce";
import apiClient from "@/lib/axios";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Cetak Ulang Struk</h1>
        <p className="text-slate-400 text-sm mt-1">
          Cari order dan cetak ulang struk pelanggan atau dapur
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Cari kode order, nama pelanggan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
        />
      </div>

      {/* Orders list */}
      <div className="space-y-2">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 bg-slate-800 rounded-xl animate-pulse"
            />
          ))}

        {!isLoading &&
          (data?.data ?? []).map((order: any) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {order.order_code}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-400">
                      {order.customer ?? "Walk-in"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <OrderStatusBadge status={order.status} />
                <Button
                  size="sm"
                  className="h-8 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5"
                  onClick={() => setReprint(order.id)}
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak
                </Button>
              </div>
            </div>
          ))}

        {!isLoading && (data?.data ?? []).length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Printer className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Tidak ada order ditemukan</p>
          </div>
        )}
      </div>

      <ReprintDialog orderId={reprint} onClose={() => setReprint(null)} />
    </div>
  );
}
