import {
  ChevronRight,
  Clock,
  MapPin,
  ShoppingBag,
  Package,
  Bike,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

interface Props {
  order: Order;
  onView: (order: Order) => void;
}

// Mapping untuk tipe order
const TYPE_CONFIG: Record<
  string,
  { icon: LucideIcon; color: string; bg: string }
> = {
  dine_in: {
    icon: Store,
    color: "text-earth-500",
    bg: "bg-earth-500/10",
  },
  take_away: {
    icon: Package,
    color: "text-heart-500",
    bg: "bg-heart-500/10",
  },
  delivery: {
    icon: Bike,
    color: "text-glow-500",
    bg: "bg-glow-500/10",
  },
};

export function OrderCard({ order, onView }: Props) {
  const typeConfig = TYPE_CONFIG[order.order_type] || TYPE_CONFIG.dine_in;
  const TypeIcon = typeConfig.icon;
  const itemCount = order.items?.length || 0;
  const firstItems = order.items?.slice(0, 2) || [];
  const remainingCount = itemCount - 2;

  return (
    <Card
      className="group bg-card border-border hover:border-heart-500/30 hover:shadow-lg hover:shadow-heart-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => onView(order)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                typeConfig.bg,
              )}
            >
              <TypeIcon className={cn("w-4 h-4", typeConfig.color)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                {order.order_code}
                {order.table_number && (
                  <Badge
                    variant="outline"
                    className="text-[8px] bg-muted text-muted-foreground border-border"
                  >
                    Meja {order.table_number}
                  </Badge>
                )}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(order.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Items preview */}
        <div className="flex items-start gap-2 text-muted-foreground">
          <div
            className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
              typeConfig.bg,
            )}
          >
            <ShoppingBag className={cn("w-3 h-3", typeConfig.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1">
              {firstItems.map((item, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-muted text-foreground border-border text-[10px] font-normal"
                >
                  {item.menu?.name} x{item.qty}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-muted text-foreground border-border text-[10px] font-normal"
                >
                  +{remainingCount} lainnya
                </Badge>
              )}
            </div>
            {itemCount === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Tidak ada item
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center",
                typeConfig.bg,
              )}
            >
              {order.order_type === "delivery" ? (
                <MapPin className={cn("w-3 h-3", typeConfig.color)} />
              ) : (
                <Clock className={cn("w-3 h-3", typeConfig.color)} />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {order.order_type === "delivery" ? (
                order.delivery?.address ? (
                  <>
                    {order.delivery.address.length > 25
                      ? `${order.delivery.address.slice(0, 25)}...`
                      : order.delivery.address}
                  </>
                ) : (
                  "Alamat tidak tersedia"
                )
              ) : (
                order.order_type_label
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-bold text-heart-500">
                {order.formatted_total}
              </p>
              {order.payment?.status === "partial" && (
                <p className="text-[8px] text-glow-500">
                  DP: Rp {order.payment.amount_paid?.toLocaleString("id-ID")}
                </p>
              )}
            </div>
            <div className="w-6 h-6 rounded-full bg-muted/50 group-hover:bg-heart-500/10 flex items-center justify-center transition-colors">
              <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-heart-500 transition-colors" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
