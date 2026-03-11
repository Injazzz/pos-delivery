/* eslint-disable @typescript-eslint/no-explicit-any */

import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  Receipt,
  Clock,
  Tag,
  Truck,
  Percent,
  CreditCard,
  Store,
  User,
} from "lucide-react";
import type { Order } from "@/types/order";

export function PaymentSummary({ order }: { order: Order }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-heart-500/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-heart-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kode Pesanan</p>
              <p className="text-base font-bold text-foreground">
                {order.order_code}
              </p>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Customer & type info */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-border gap-1"
          >
            <Store className="w-3 h-3" />
            {order.order_type_label}
          </Badge>
          {order.table_number && (
            <Badge
              variant="outline"
              className="bg-muted text-muted-foreground border-border gap-1"
            >
              <Tag className="w-3 h-3" />
              Meja {order.table_number}
            </Badge>
          )}
          {order.customer && (
            <Badge
              variant="outline"
              className="bg-muted text-muted-foreground border-border gap-1"
            >
              <User className="w-3 h-3" />
              {order.customer.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Item Pesanan
        </p>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-2 text-sm group hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
            >
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-muted-foreground font-medium shrink-0">
                  {item.qty}x
                </span>
                <span className="text-foreground truncate">
                  {item.menu?.name}
                </span>
                {item.note && (
                  <span className="text-muted-foreground/60 text-xs truncate italic">
                    ({item.note})
                  </span>
                )}
              </div>
              <span className="text-foreground font-medium shrink-0">
                {formatCurrency(item.subtotal || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Price breakdown */}
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Rincian Pembayaran
        </p>
        <div className="space-y-2">
          {[
            { label: "Subtotal", value: order.subtotal, icon: ShoppingBag },
            { label: "Pajak (11%)", value: order.tax, icon: Percent },
            order.delivery_fee > 0 && {
              label: "Ongkos Kirim",
              value: order.delivery_fee,
              icon: Truck,
            },
            order.discount > 0 && {
              label: "Diskon",
              value: -order.discount,
              icon: Tag,
            },
          ]
            .filter(Boolean)
            .map((row: any) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                    <row.icon className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{row.label}</span>
                </div>
                <span
                  className={cn(
                    "font-medium",
                    row.value < 0 ? "text-emerald-500" : "text-foreground",
                  )}
                >
                  {row.value < 0 ? "-" : ""}
                  {formatCurrency(Math.abs(row.value))}
                </span>
              </div>
            ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-heart-500/10 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-heart-500" />
            </div>
            <span className="text-base font-bold text-foreground">TOTAL</span>
          </div>
          <span className="text-2xl font-bold text-heart-500">
            {order.formatted_total}
          </span>
        </div>
      </div>

      {/* Existing payment info (partial) */}
      {order.payment &&
        order.payment.status === "partial" &&
        order.payment.amount_paid != null && (
          <div className="mx-4 mb-4 p-4 bg-glow-500/10 border border-glow-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-glow-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-glow-500" />
              </div>
              <p className="text-sm font-semibold text-glow-500">
                Downpayment Tercatat
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sudah dibayar</span>
                <span className="text-emerald-500 font-medium">
                  {formatCurrency(order.payment.amount_paid || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sisa tagihan</span>
                <span className="text-glow-500 font-bold">
                  {formatCurrency(order.payment.amount_remaining || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
