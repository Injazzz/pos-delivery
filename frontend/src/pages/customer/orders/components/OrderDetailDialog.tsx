/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";
import { ordersApi } from "@/api/orders";
import type { Order } from "@/types/order";

interface Props {
  order: Order | null;
  onClose: () => void;
  onReview: (order: Order) => void;
}

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

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center justify-between">
            <span>Detail Pesanan</span>
            <OrderStatusBadge status={order.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Kode", value: order.order_code },
              { label: "Tipe", value: order.order_type_label },
              {
                label: "Tanggal",
                value: new Date(order.created_at).toLocaleDateString("id-ID"),
              },
              { label: "Total", value: order.formatted_total },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-foreground font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
              Item Pesanan
            </p>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.menu?.first_image_url && (
                      <img
                        src={item.menu.first_image_url}
                        alt={item.menu?.name}
                        className="w-8 h-8 rounded-md object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {item.menu?.name}
                      </p>
                      {item.note && (
                        <p className="text-xs text-muted-foreground truncate">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">x{item.qty}</p>
                    <p className="text-sm text-accent font-medium">
                      {item.formatted_subtotal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Pajak (11%)</span>
              <span>Rp {order.tax.toLocaleString("id-ID")}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Ongkir</span>
                <span>Rp {order.delivery_fee.toLocaleString("id-ID")}</span>
              </div>
            )}
            <Separator className="bg-border my-1" />
            <div className="flex justify-between font-bold text-foreground">
              <span>Total</span>
              <span className="text-accent">{order.formatted_total}</span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">
              Riwayat Status
            </p>
            <OrderTimeline order={order} />
          </div>

          {/* Actions */}
          {(canMarkReceived || canReview) && (
            <div className="flex gap-2 pt-2">
              {canMarkReceived && (
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2"
                  disabled={receivedMutation.isPending}
                  onClick={() => receivedMutation.mutate(order.id)}
                >
                  <CheckCircle className="w-4 h-4" />
                  {receivedMutation.isPending
                    ? "Memproses..."
                    : "Pesanan Diterima"}
                </Button>
              )}
              {canReview && (
                <Button
                  variant="outline"
                  className="flex-1 border-accent/50 text-accent hover:bg-accent/10 gap-2"
                  onClick={() => onReview(order)}
                >
                  <Star className="w-4 h-4" />
                  Beri Ulasan
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
