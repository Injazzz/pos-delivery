/* eslint-disable @typescript-eslint/no-explicit-any */

import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import type { Order } from "@/types/order";

export function PaymentSummary({ order }: { order: Order }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Kode Pesanan</p>
          <p className="text-base font-bold text-white">{order.order_code}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <Separator className="bg-slate-800" />

      {/* Items */}
      <div className="space-y-2">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between gap-2 text-sm">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-slate-500 shrink-0">{item.qty}x</span>
              <span className="text-slate-300 truncate">{item.menu?.name}</span>
              {item.note && (
                <span className="text-slate-600 text-xs truncate">
                  ({item.note})
                </span>
              )}
            </div>
            <span className="text-slate-300 shrink-0">
              {item.formatted_subtotal}
            </span>
          </div>
        ))}
      </div>

      <Separator className="bg-slate-800" />

      {/* Price breakdown */}
      <div className="space-y-1.5 text-sm">
        {[
          { label: "Subtotal", value: order.subtotal },
          { label: "Pajak (11%)", value: order.tax },
          order.delivery_fee > 0 && {
            label: "Ongkir",
            value: order.delivery_fee,
          },
          order.discount > 0 && { label: "Diskon", value: -order.discount },
        ]
          .filter(Boolean)
          .map((row: any) => (
            <div
              key={row.label}
              className="flex justify-between text-slate-400"
            >
              <span>{row.label}</span>
              <span>Rp {Math.abs(row.value).toLocaleString("id-ID")}</span>
            </div>
          ))}
        <div className="flex justify-between font-bold text-base pt-1 border-t border-slate-800">
          <span className="text-white">TOTAL</span>
          <span className="text-amber-400">{order.formatted_total}</span>
        </div>
      </div>

      {/* Existing payment info (partial) */}
      {order.payment && order.payment.status === "partial" && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-sm">
          <p className="text-orange-400 font-medium mb-1">
            Downpayment Tercatat
          </p>
          <div className="flex justify-between text-slate-400">
            <span>Sudah dibayar</span>
            <span className="text-white">
              Rp {order.payment.amount_paid.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-400">Sisa tagihan</span>
            <span className="text-orange-400 font-bold">
              Rp {order.payment.amount_remaining.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      )}

      {/* Customer & type info */}
      <div className="flex gap-2 text-xs text-slate-500">
        <span className="bg-slate-800 rounded-md px-2 py-1">
          {order.order_type_label}
        </span>
        {order.table_number && (
          <span className="bg-slate-800 rounded-md px-2 py-1">
            Meja {order.table_number}
          </span>
        )}
        {order.customer && (
          <span className="bg-slate-800 rounded-md px-2 py-1">
            {order.customer.name}
          </span>
        )}
      </div>
    </div>
  );
}
