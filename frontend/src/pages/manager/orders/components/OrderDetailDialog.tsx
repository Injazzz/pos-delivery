/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { 
  Clock, 
  User, 
  MapPin, 
  CreditCard, 
  Receipt,
  Bike,
  Store,
  Package 
} from "lucide-react";
import type { Order } from "@/types/order";
import { cn } from "@/lib/utils";

interface Props {
  order: Order | null;
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  dine_in: "Makan di Tempat",
  take_away: "Bawa Pulang",
  delivery: "Delivery",
};

const TYPE_ICON: Record<string, any> = {
  dine_in: Store,
  take_away: Package,
  delivery: Bike,
};

const TYPE_COLOR: Record<string, string> = {
  dine_in: "text-earth-500",
  take_away: "text-heart-500",
  delivery: "text-glow-500",
};

const TYPE_BG: Record<string, string> = {
  dine_in: "bg-earth-500/10",
  take_away: "bg-heart-500/10",
  delivery: "bg-glow-500/10",
};

export function ManagerOrderDetailDialog({ order, onClose }: Props) {
  if (!order) return null;

  const TypeIcon = TYPE_ICON[order.order_type] || Store;
  const typeColor = TYPE_COLOR[order.order_type] || "text-muted-foreground";
  const typeBg = TYPE_BG[order.order_type] || "bg-muted";

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", typeBg)}>
                <TypeIcon className={cn("w-5 h-5", typeColor)} />
              </div>
              <div>
                <DialogTitle className="text-foreground text-lg">
                  {order.order_code}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detail pesanan
                </p>
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { 
                icon: TypeIcon, 
                label: "Tipe Pesanan", 
                value: TYPE_LABEL[order.order_type] ?? order.order_type,
                color: typeColor 
              },
              { icon: User, label: "Kasir", value: order.cashier?.name ?? "-" },
              { icon: User, label: "Customer", value: order.customer?.name ?? "Walk-in" },
              { icon: Store, label: "No. Meja", value: order.table_number ?? "-" },
              { 
                icon: Clock, 
                label: "Waktu", 
                value: new Date(order.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) 
              },
              { icon: CreditCard, label: "Pembayaran", value: order.payment?.method ?? "-" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-muted/50 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("w-3.5 h-3.5", color || "text-muted-foreground")} />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {label}
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground capitalize truncate">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Item Pesanan
              </p>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-auto">
                {order.items?.length || 0} item
              </span>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-border/50"
                >
                  {item.menu?.first_image_url ? (
                    <img
                      src={item.menu.first_image_url}
                      alt=""
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
                        <p className="text-xs text-muted-foreground">x{item.qty}</p>
                        <p className="text-sm font-bold text-heart-500">
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
              <span className="text-muted-foreground">Pajak</span>
              <span className="text-foreground font-medium">
                Rp {order.tax.toLocaleString("id-ID")}
              </span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ongkir</span>
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
            
            {order.payment && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-muted-foreground">Status Bayar</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-medium",
                    order.payment.status === "paid"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : order.payment.status === "partial"
                        ? "bg-glow-500/10 text-glow-500 border-glow-500/30"
                        : "bg-destructive/10 text-destructive border-destructive/30"
                  )}
                >
                  <span className="flex items-center gap-1">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      order.payment.status === "paid" ? "bg-emerald-500" :
                      order.payment.status === "partial" ? "bg-glow-500" :
                      "bg-destructive"
                    )} />
                    {order.payment.status === "paid"
                      ? "Lunas"
                      : order.payment.status === "partial"
                        ? "DP"
                        : "Belum Bayar"}
                  </span>
                </Badge>
              </div>
            )}
          </div>

          {/* Status log */}
          {order.status_logs && order.status_logs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Riwayat Status
                </p>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {order.status_logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-muted/30">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-heart-500" />
                      {order.status_logs && i < order.status_logs.length - 1 && (
                        <div className="absolute top-3 left-1 w-px h-8 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-medium">
                          {log.to}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {log.updated_by}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(log.updated_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery info */}
          {order.delivery && (
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Info Pengiriman
                </p>
              </div>
              <p className="text-sm text-foreground mb-2">{order.delivery.address}</p>
              {order.delivery.courier && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span>Kurir: <span className="text-foreground font-medium">{order.delivery.courier.name}</span></span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}