import {
  Eye,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

interface Meta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
  per_page: number;
}

interface Props {
  orders: Order[];
  isLoading: boolean;
  meta?: Meta;
  onPageChange: (page: number) => void;
  getPaymentMethodLabel: (method: string | undefined) => string;
  getPaymentStatusBadgeColor: (status: string | undefined) => string;
  getPaymentStatusLabel: (status: string | undefined) => string;
}

export function HistoryTable({
  orders,
  isLoading,
  meta,
  onPageChange,
  getPaymentMethodLabel,
  getPaymentStatusBadgeColor,
  getPaymentStatusLabel,
}: Props) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 bg-muted" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <Receipt className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Tidak ada pesanan</p>
      </div>
    );
  }

  const perPage = meta?.per_page || 10;

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Kode Pesanan
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Metode
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status Bayar
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Waktu
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order: Order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-heart-500">
                      {order.order_code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {order.customer?.name || "Walk-in"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-heart-500">
                    Rp {order.total_price?.toLocaleString("id-ID") || 0}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className="bg-muted text-muted-foreground border-border text-xs"
                    >
                      {getPaymentMethodLabel(order.payment?.method)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        "text-xs font-medium",
                        getPaymentStatusBadgeColor(order.payment?.status),
                      )}
                    >
                      {getPaymentStatusLabel(order.payment?.status)}
                      {order.payment?.status === "partial" &&
                        order.payment?.amount_remaining && (
                          <span className="ml-1 text-[10px] opacity-75">
                            (Rp{" "}
                            {order.payment.amount_remaining.toLocaleString(
                              "id-ID",
                            )}
                            )
                          </span>
                        )}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {order.created_at
                      ? formatDistanceToNow(new Date(order.created_at), {
                          locale: idLocale,
                          addSuffix: true,
                        })
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/cashier/payment/${order.id}`)}
                        title="Lihat detail & proses pembayaran"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* Lunasi button - only for partial DP orders */}
                      {order.payment?.status === "partial" &&
                        order.payment?.method === "downpayment" && (
                          <Button
                            size="sm"
                            className="bg-glow-500 hover:bg-glow-600 text-foreground font-semibold"
                            onClick={() =>
                              navigate(`/cashier/payment/${order.id}`)
                            }
                            title="Lunasi pembayaran sisa DP"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Lunasi
                          </Button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground order-2 sm:order-1">
            Menampilkan {meta.from}–{meta.to} dari {meta.total} pesanan
            <span className="text-[10px] ml-1">({perPage} per halaman)</span>
          </span>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-8 h-8 bg-background border-border text-muted-foreground",
                "hover:bg-muted hover:text-foreground",
                "disabled:opacity-30 disabled:hover:bg-background",
                "transition-all",
              )}
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                let pageNumber: number | null = null;

                if (meta.last_page <= 5) {
                  pageNumber = i + 1;
                } else {
                  const current = meta.current_page;
                  if (current <= 3) {
                    pageNumber = i + 1;
                  } else if (current >= meta.last_page - 2) {
                    pageNumber = meta.last_page - 4 + i;
                  } else {
                    pageNumber = current - 2 + i;
                  }
                }

                if (
                  !pageNumber ||
                  pageNumber < 1 ||
                  pageNumber > meta.last_page
                )
                  return null;

                const isActive = pageNumber === meta.current_page;

                return (
                  <Button
                    key={pageNumber}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-8 h-8 p-0 text-xs font-medium",
                      isActive
                        ? "bg-heart-500 hover:bg-heart-600 text-white shadow-sm shadow-heart-500/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-8 h-8 bg-background border-border text-muted-foreground",
                "hover:bg-muted hover:text-foreground",
                "disabled:opacity-30 disabled:hover:bg-background",
                "transition-all",
              )}
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
