/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Star,
  CheckCircle,
  Package,
  Bike,
  Store,
  Calendar,
  Receipt,
  Clock,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";
import { ordersApi } from "@/api/orders";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

interface Props {
  order: Order | null;
  onClose: () => void;
  onReview: (order: Order) => void;
}

// Mapping untuk tipe order
const TYPE_CONFIG: Record<
  string,
  { icon: any; color: string; bg: string; label: string }
> = {
  dine_in: {
    icon: Store,
    color: "text-earth-500",
    bg: "bg-earth-500/10",
    label: "Makan di Tempat",
  },
  take_away: {
    icon: Package,
    color: "text-heart-500",
    bg: "bg-heart-500/10",
    label: "Bawa Pulang",
  },
  delivery: {
    icon: Bike,
    color: "text-glow-500",
    bg: "bg-glow-500/10",
    label: "Delivery",
  },
};

export function OrderDetailDialog({ order, onClose, onReview }: Props) {
  const qc = useQueryClient();

  const receivedMutation = useMutation({
    mutationFn: (id: number) => ordersApi.customerMarkReceived(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  if (!order) return null;

  const canMarkReceived = order.status === "delivered" && !order.review;
  const canReview = order.status === "delivered" && !order.review;
  const typeConfig = TYPE_CONFIG[order.order_type] || TYPE_CONFIG.dine_in;
  const TypeIcon = typeConfig.icon;

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                typeConfig.bg,
              )}
            >
              <TypeIcon className={cn("w-5 h-5", typeConfig.color)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-foreground text-lg">
                Detail Pesanan
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {order.order_code}
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider">
                  Tanggal
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {new Date(order.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(order.created_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="bg-muted/30 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider">
                  Total
                </span>
              </div>
              <p className="text-lg font-bold text-heart-500">
                {order.formatted_total}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {order.payment?.method === "downpayment"
                  ? "DP + Pelunasan"
                  : "Lunas"}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Item Pesanan ({order.items?.length || 0})
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-border/50"
                >
                  {item.menu?.first_image_url ? (
                    <img
                      src={item.menu.first_image_url}
                      alt={item.menu?.name}
                      className="w-12 h-12 rounded-md object-cover shrink-0 border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.menu?.name}
                        </p>
                        {item.note && (
                          <p className="text-[10px] text-muted-foreground italic mt-0.5">
                            "{item.note}"
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-muted text-muted-foreground border-border"
                        >
                          x{item.qty}
                        </Badge>
                        <p className="text-sm font-bold text-heart-500 mt-1">
                          {item.formatted_subtotal}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground font-medium">
                Rp {order.subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pajak (11%)</span>
              <span className="text-foreground font-medium">
                Rp {order.tax.toLocaleString("id-ID")}
              </span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                <span className="text-foreground font-medium">
                  Rp {order.delivery_fee.toLocaleString("id-ID")}
                </span>
              </div>
            )}
            <Separator className="bg-border" />
            <div className="flex justify-between text-base font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-heart-500">{order.formatted_total}</span>
            </div>

            {order.payment?.status === "partial" && (
              <div className="flex justify-between text-xs pt-2 border-t border-border">
                <span className="text-muted-foreground">DP Dibayar</span>
                <span className="text-glow-500 font-medium">
                  Rp {order.payment.amount_paid?.toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Riwayat Status
              </p>
            </div>
            <OrderTimeline order={order} />
          </div>

          {/* Actions */}
          {(canMarkReceived || canReview) && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {canMarkReceived && (
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                  disabled={receivedMutation.isPending}
                  onClick={() => receivedMutation.mutate(order.id)}
                >
                  {receivedMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Pesanan Diterima</span>
                    </>
                  )}
                </Button>
              )}
              {canReview && (
                <Button
                  variant="outline"
                  className="flex-1 border-heart-500/30 text-heart-500 hover:bg-heart-500/10 gap-2"
                  onClick={() => onReview(order)}
                >
                  <Star className="w-4 h-4" />
                  <span>Beri Ulasan</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
