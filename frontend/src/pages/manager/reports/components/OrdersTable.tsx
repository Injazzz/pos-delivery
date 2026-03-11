/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Store,
  Package,
  Bike,
  Calendar,
  User,
  CreditCard,
  Receipt,
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
import { cn } from "@/lib/utils";
import { reportsApi } from "@/api/reports";
import type { ReportFilters } from "@/types/report";

interface Props {
  filters: ReportFilters;
}

const TYPE_LABEL: Record<string, string> = {
  dine_in: "Makan di Tempat",
  takeaway: "Bawa Pulang",
  delivery: "Delivery",
};

const TYPE_ICON: Record<string, any> = {
  dine_in: Store,
  takeaway: Package,
  delivery: Bike,
};

const TYPE_COLOR: Record<string, string> = {
  dine_in: "text-earth-500",
  takeaway: "text-heart-500",
  delivery: "text-glow-500",
};

const TYPE_BG: Record<string, string> = {
  dine_in: "bg-earth-500/10",
  takeaway: "bg-heart-500/10",
  delivery: "bg-glow-500/10",
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
  const perPage = meta?.per_page || 15;

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
                Jenis
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
                Pelunasan
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Waktu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading Skeleton */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24 bg-muted" />
                      <Skeleton className="h-3 w-16 bg-muted" />
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
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-16 bg-muted rounded-full" />
                      <Skeleton className="h-3 w-12 bg-muted" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20 bg-muted" />
                      <Skeleton className="h-3 w-16 bg-muted" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 bg-muted ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {/* Data Rows */}
            {!isLoading &&
              orders.map((order: any) => {
                const TypeIcon = TYPE_ICON[order.type] || Store;
                const typeColor =
                  TYPE_COLOR[order.type] || "text-muted-foreground";
                const typeBg = TYPE_BG[order.type] || "bg-muted";

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
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            typeBg,
                          )}
                        >
                          <TypeIcon className={cn("w-4 h-4", typeColor)} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {order.order_code}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              {order.customer || "Walk-in"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Order Type */}
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {TYPE_LABEL[order.type] ?? order.type}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>

                    {/* Total */}
                    <TableCell>
                      <span className="text-sm font-medium text-heart-500">
                        Rp {order.total.toLocaleString("id-ID")}
                      </span>
                    </TableCell>

                    {/* Payment Method & Status */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-foreground capitalize font-medium">
                            {order.payment_method === "cash" && "Tunai"}
                            {order.payment_method === "transfer" && "Transfer"}
                            {order.payment_method === "qris" && "QRIS"}
                            {order.payment_method === "midtrans" && "Midtrans"}
                            {!["cash", "transfer", "qris", "midtrans"].includes(
                              order.payment_method,
                            ) &&
                              (order.payment_method === "-"
                                ? "-"
                                : order.payment_method)}
                          </span>
                        </div>
                        {order.payment_status &&
                          order.payment_status !== "-" && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-medium w-fit",
                                order.payment_status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                  : order.payment_status === "partial"
                                    ? "bg-glow-500/10 text-glow-500 border-glow-500/30"
                                    : "bg-destructive/10 text-destructive border-destructive/30",
                              )}
                            >
                              {order.payment_status === "paid"
                                ? "Lunas"
                                : order.payment_status === "partial"
                                  ? "DP"
                                  : "Belum"}
                            </Badge>
                          )}
                      </div>
                    </TableCell>

                    {/* Pelunasan */}
                    <TableCell>
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-foreground">
                          Rp {(order.amount_paid ?? 0).toLocaleString("id-ID")}
                        </span>
                        {order.payment_status === "partial" &&
                          order.amount_remaining > 0 && (
                            <p className="text-[10px] text-glow-500">
                              Sisa: Rp{" "}
                              {(order.amount_remaining ?? 0).toLocaleString(
                                "id-ID",
                              )}
                            </p>
                          )}
                      </div>
                    </TableCell>

                    {/* Time */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(order.created_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
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
                      <Receipt className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Tidak ada data order
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Tidak ada order dalam periode yang dipilih
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
            Menampilkan {meta.from}–{meta.to} dari {meta.total} order
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
              onClick={() => setPage((p) => p - 1)}
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
