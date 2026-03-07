import { Eye, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import type { Order } from "@/types/order";

const TYPE_LABEL: Record<string, string> = {
  dine_in: "Makan",
  take_away: "Bawa",
  delivery: "Delivery",
};

interface Meta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
}

interface Props {
  orders: Order[];
  isLoading: boolean;
  meta?: Meta;
  onView: (order: Order) => void;
  onChangeStatus: (order: Order) => void;
  onPageChange: (page: number) => void;
}

export function OrderTable({
  orders,
  isLoading,
  meta,
  onView,
  onChangeStatus,
  onPageChange,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden lg:grid grid-cols-[1fr_80px_100px_110px_120px_90px_100px] gap-3 px-4 py-2 text-[10px] text-slate-500 uppercase tracking-wider font-medium">
        <span>Order</span>
        <span>Tipe</span>
        <span>Status</span>
        <span>Total</span>
        <span>Pembayaran</span>
        <span>Waktu</span>
        <span className="text-right">Aksi</span>
      </div>

      {/* Skeleton */}
      {isLoading &&
        Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 bg-slate-800 rounded-xl" />
        ))}

      {/* Rows */}
      {!isLoading &&
        orders.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-2 lg:grid-cols-[1fr_80px_100px_110px_120px_90px_100px] gap-3 items-center px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
          >
            {/* Order info */}
            <div>
              <p className="text-sm font-semibold text-white">
                {order.order_code}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {order.customer?.name ?? "Walk-in"}
                {order.table_number && ` · Meja ${order.table_number}`}
              </p>
            </div>

            {/* Tipe */}
            <span className="hidden lg:block text-xs text-slate-400">
              {TYPE_LABEL[order.order_type] ?? order.order_type}
            </span>

            {/* Status */}
            <div className="hidden lg:block">
              <OrderStatusBadge status={order.status} />
            </div>

            {/* Total */}
            <span className="hidden lg:block text-sm font-medium text-white">
              {order.formatted_total}
            </span>

            {/* Payment */}
            <div className="hidden lg:block">
              {order.payment ? (
                <Badge
                  variant="outline"
                  className={
                    order.payment.status === "paid"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                      : order.payment.status === "partial"
                        ? "bg-orange-500/10 text-orange-400 border-orange-500/30 text-[10px]"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/30 text-[10px]"
                  }
                >
                  {order.payment.status === "paid"
                    ? "Lunas"
                    : order.payment.status === "partial"
                      ? "DP"
                      : "Belum"}
                </Badge>
              ) : (
                <span className="text-xs text-slate-600">—</span>
              )}
            </div>

            {/* Waktu */}
            <span className="hidden lg:block text-[11px] text-slate-500">
              {new Date(order.created_at).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {/* Aksi */}
            <div className="flex items-center justify-end gap-1.5 col-span-1">
              {/* Mobile: tampilkan status di sini */}
              <div className="lg:hidden">
                <OrderStatusBadge status={order.status} />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => onView(order)}
                title="Lihat detail"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                onClick={() => onChangeStatus(order)}
                title="Ubah status"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

      {/* Empty */}
      {!isLoading && orders.length === 0 && (
        <div className="text-center py-14 text-slate-500 text-sm">
          Tidak ada pesanan ditemukan
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500">
            {meta.from}–{meta.to} dari {meta.total} pesanan
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
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
              onClick={() => onPageChange(meta.current_page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
