import { Printer, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import type { OrderStatus } from "@/types/order";

interface Order {
  id: number;
  order_code: string;
  status: OrderStatus;
  customer?: string;
  created_at: string;
}

interface Props {
  order: Order;
  onPrint: (orderId: number) => void;
}

export function ReceiptOrderCard({ order, onPrint }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="group bg-card border border-border rounded-xl hover:border-heart-500/30 hover:shadow-md hover:shadow-heart-500/5 transition-all">
      {/* Mobile Layout */}
      <div className="lg:hidden p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {order.order_code}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.customer ?? "Walk-in"}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(order.created_at)}</span>
          </div>

          <Button
            size="sm"
            className="h-8 px-3 bg-heart-500 hover:bg-heart-600 text-white text-xs gap-1.5"
            onClick={() => onPrint(order.id)}
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-[1fr,1fr,120px,100px] gap-4 items-center px-4 py-3">
        {/* Order Info */}
        <div>
          <p className="text-sm font-semibold text-foreground">
            {order.order_code}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {formatDate(order.created_at)}
            </span>
          </div>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-foreground">
            {order.customer ?? "Walk-in"}
          </span>
        </div>

        {/* Status */}
        <OrderStatusBadge status={order.status} />

        {/* Action */}
        <div className="flex justify-end">
          <Button
            size="sm"
            className="h-8 px-3 bg-heart-500 hover:bg-heart-600 text-white text-xs gap-1.5"
            onClick={() => onPrint(order.id)}
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak
          </Button>
        </div>
      </div>
    </div>
  );
}
