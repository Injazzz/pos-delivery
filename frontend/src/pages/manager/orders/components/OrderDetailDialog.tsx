import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import type { Order } from "@/types/order";

interface Props {
  order: Order | null;
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  dine_in: "Makan di Tempat",
  take_away: "Bawa Pulang",
  delivery: "Delivery",
};

export function ManagerOrderDetailDialog({ order, onClose }: Props) {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>{order.order_code}</span>
            <OrderStatusBadge status={order.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              {
                label: "Tipe",
                value: TYPE_LABEL[order.order_type] ?? order.order_type,
              },
              { label: "Kasir", value: order.cashier?.name ?? "-" },
              { label: "Customer", value: order.customer?.name ?? "Walk-in" },
              { label: "No. Meja", value: order.table_number ?? "-" },
              {
                label: "Waktu",
                value: new Date(order.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
              { label: "Pembayaran", value: order.payment?.method ?? "-" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800 rounded-lg px-3 py-2">
                <p className="text-slate-500">{label}</p>
                <p className="text-white font-medium mt-0.5 capitalize">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">
              Item Pesanan
            </p>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.menu?.first_image_url && (
                      <img
                        src={item.menu.first_image_url}
                        alt=""
                        className="w-8 h-8 rounded-md object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">
                        {item.menu?.name}
                      </p>
                      {item.note && (
                        <p className="text-xs text-slate-500 truncate">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">x{item.qty}</p>
                    <p className="text-sm text-amber-400 font-medium">
                      {item.formatted_subtotal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pajak</span>
              <span>Rp {order.tax.toLocaleString("id-ID")}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Ongkir</span>
                <span>Rp {order.delivery_fee.toLocaleString("id-ID")}</span>
              </div>
            )}
            <Separator className="bg-slate-700" />
            <div className="flex justify-between font-bold text-white">
              <span>Total</span>
              <span className="text-amber-400">{order.formatted_total}</span>
            </div>
            {order.payment && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Status Bayar</span>
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
                      : "Belum Bayar"}
                </Badge>
              </div>
            )}
          </div>

          {/* Status log */}
          {order.status_logs && order.status_logs.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">
                Riwayat Status
              </p>
              <div className="space-y-1.5">
                {order.status_logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-slate-400">
                      {log.from ? `${log.from} → ` : ""}
                      {log.to}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-600">{log.updated_by}</span>
                    <span className="text-slate-700 ml-auto">
                      {new Date(log.updated_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery info */}
          {order.delivery && (
            <div className="bg-slate-800 rounded-lg p-3 text-sm space-y-1">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                Info Pengiriman
              </p>
              <p className="text-white">{order.delivery.address}</p>
              {order.delivery.courier && (
                <p className="text-slate-400">
                  Kurir:{" "}
                  <span className="text-white">
                    {order.delivery.courier.name}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
