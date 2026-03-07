/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { reportsApi } from "@/api/reports";
import type { ReportFilters } from "@/types/report";

interface Props {
  filters: ReportFilters;
}

const TYPE_LABEL: Record<string, string> = {
  dine_in: "Makan",
  takeaway: "Bawa",
  delivery: "Delivery",
};

export function OrdersTable({ filters }: Props) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["report-orders", filters, page],
    queryFn: () =>
      reportsApi.getOrders(filters, { page, per_page: 15 }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-[1fr_80px_100px_120px_100px_90px] gap-3 px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider font-medium">
        <span>Order</span>
        <span>Jenis</span>
        <span>Status</span>
        <span>Total</span>
        <span>Pembayaran</span>
        <span className="text-right">Waktu</span>
      </div>

      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 bg-slate-800 rounded-xl" />
        ))}

      {orders.map((o: any) => (
        <div
          key={o.id}
          className="grid grid-cols-2 sm:grid-cols-[1fr_80px_100px_120px_100px_90px] gap-3 items-center px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors text-xs"
        >
          <div>
            <p className="font-semibold text-white">{o.order_code}</p>
            <p className="text-slate-500 text-[10px]">{o.customer}</p>
          </div>
          <span className="text-slate-400 hidden sm:block">
            {TYPE_LABEL[o.type] ?? o.type}
          </span>
          <div className="hidden sm:block">
            <OrderStatusBadge status={o.status} />
          </div>
          <span className="font-medium text-white hidden sm:block">
            Rp {o.total.toLocaleString("id-ID")}
          </span>
          <span className="text-slate-400 hidden sm:block capitalize">
            {o.payment_method}
          </span>
          <div className="text-right">
            <p className="text-slate-400 text-[10px]">
              {new Date(o.created_at).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <div className="sm:hidden mt-0.5">
              <OrderStatusBadge status={o.status} />
            </div>
          </div>
        </div>
      ))}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-sm">
          Tidak ada data order untuk periode ini
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400 pt-1">
          <span className="text-xs">
            {meta.from}–{meta.to} dari {meta.total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              disabled={meta.current_page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs px-3 py-1 bg-slate-800 rounded-md border border-slate-700 text-white">
              {meta.current_page} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
