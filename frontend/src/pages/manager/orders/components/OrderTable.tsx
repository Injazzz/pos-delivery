import {
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Store,
  Package,
  Bike,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/types/order";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  dine_in: "Makan di Tempat",
  take_away: "Bawa Pulang",
  delivery: "Delivery",
};

const TYPE_ICON: Record<string, LucideIcon> = {
  dine_in: Store,
  take_away: Package,
  delivery: Bike,
};

const TYPE_COLOR: Record<string, string> = {
  dine_in: "text-earth-500",
  take_away: "text-heart-500",
  delivery: "text-glow-500",
};

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
  const perPage = meta?.per_page || 20;

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground font-medium">
                Order
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Tipe
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Total
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Pembayaran
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Waktu
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading Skeleton */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg bg-muted" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24 bg-muted" />
                        <Skeleton className="h-3 w-16 bg-muted" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 bg-muted rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 bg-muted rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 bg-muted ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {/* Data Rows */}
            {!isLoading &&
              orders.map((order) => {
                const TypeIcon = TYPE_ICON[order.order_type] || Store;
                const typeColor =
                  TYPE_COLOR[order.order_type] || "text-muted-foreground";

                return (
                  <TableRow
                    key={order.id}
                    className="border-border hover:bg-muted/50 transition-colors group"
                  >
                    {/* Order Info */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            `bg-${typeColor.replace("text-", "")}/10`,
                          )}
                        >
                          <TypeIcon className={cn("w-4 h-4", typeColor)} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {order.order_code}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer?.name ?? "Walk-in"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Tipe */}
                    <TableCell>
                      <span className="text-xs text-muted-foreground capitalize">
                        {TYPE_LABEL[order.order_type] ?? order.order_type}
                        {order.table_number && ` di Meja ${order.table_number}`}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>

                    {/* Total */}
                    <TableCell>
                      <span className="text-sm font-medium text-muted-foreground">
                        {order.formatted_total}
                      </span>
                    </TableCell>

                    {/* Payment */}
                    <TableCell>
                      {order.payment ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-medium",
                            order.payment.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : order.payment.status === "partial"
                                ? "bg-glow-500/10 text-glow-500 border-glow-500/30"
                                : "bg-destructive/10 text-destructive border-destructive/30",
                          )}
                        >
                          <span className="flex items-center gap-1">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                order.payment.status === "paid"
                                  ? "bg-emerald-500"
                                  : order.payment.status === "partial"
                                    ? "bg-glow-500"
                                    : "bg-destructive",
                              )}
                            />
                            {order.payment.status === "paid"
                              ? "Lunas"
                              : order.payment.status === "partial"
                                ? "DP"
                                : "Belum"}
                          </span>
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Waktu */}
                    <TableCell>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => onView(order)}
                          title="Lihat detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-heart-500 hover:bg-muted"
                          onClick={() => onChangeStatus(order)}
                          title="Ubah status"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

            {/* Empty State */}
            {!isLoading && orders.length === 0 && (
              <TableRow className="border-border hover:bg-muted/50">
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Store className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Tidak ada pesanan ditemukan
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Coba ubah filter pencarian atau tunggu pesanan baru masuk
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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

            <span className="text-xs px-3 py-1 bg-muted rounded-md border border-border text-foreground">
              {meta.current_page} / {meta.last_page}
            </span>

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
