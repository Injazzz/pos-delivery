import { ChevronRight, Clock, MapPin, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import type { Order } from "@/types/order";

interface Props {
  order: Order;
  onView: (order: Order) => void;
}

export function OrderCard({ order, onView }: Props) {
  return (
    <Card
      className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
      onClick={() => onView(order)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white">
              {order.order_code}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(order.created_at).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Items preview */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
          <p className="text-xs truncate">
            {order.items
              ?.slice(0, 2)
              .map((i) => `${i.menu?.name} x${i.qty}`)
              .join(", ")}
            {(order.items?.length ?? 0) > 2 &&
              ` +${(order.items?.length ?? 0) - 2} lainnya`}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              {order.order_type === "delivery" ? (
                <>
                  <MapPin className="w-3 h-3" />
                  {order.delivery?.address?.slice(0, 20)}...
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  {order.order_type_label}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-amber-400">
              {order.formatted_total}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
