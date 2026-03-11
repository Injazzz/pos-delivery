import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import type { Order } from "@/types/order";

interface Props {
  orders: Order[];
  isLoading: boolean;
}

export function RecentOrdersList({ orders, isLoading }: Props) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Belum ada pesanan
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:border-heart-500/30 hover:shadow-md hover:shadow-heart-500/5 transition-all cursor-pointer group"
          onClick={() => navigate(`/cashier/payment/${order.id}`)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {order.order_code}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.customer?.name ?? "Walk-in"} · {order.items?.length ?? 0}{" "}
                item
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-bold text-heart-500">
              {order.formatted_total}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
