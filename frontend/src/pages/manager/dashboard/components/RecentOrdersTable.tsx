import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import type { RecentOrder } from "@/types/dashboard";
import type { OrderStatus } from "@/types/order";
import {
  ChevronRight,
  ShoppingBag,
  User,
  Calendar,
  UtensilsCrossed,
  Package,
  Bike,
  Store,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data?: RecentOrder[];
  isLoading: boolean;
}

export function RecentOrdersTable({ data, isLoading }: Props) {
  const navigate = useNavigate();

  // Format currency
  // const formatCurrency = (value: string | number) => {
  //   const numValue =
  //     typeof value === "string" ? parseInt(value.replace(/\D/g, "")) : value;
  //   return new Intl.NumberFormat("id-ID", {
  //     style: "currency",
  //     currency: "IDR",
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //   }).format(numValue);
  // };

  // Get order type icon and color using Lucide icons
  const getOrderTypeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case "dine in":
      case "dine_in":
      case "dine-in":
        return {
          icon: UtensilsCrossed,
          bg: "bg-earth-100 dark:bg-earth-900/30",
          text: "text-earth-700 dark:text-earth-400",
          iconColor: "text-earth-600 dark:text-earth-400",
        };
      case "take away":
      case "takeaway":
      case "take_away":
        return {
          icon: Package,
          bg: "bg-heart-100 dark:bg-heart-900/30",
          text: "text-heart-700 dark:text-heart-400",
          iconColor: "text-heart-600 dark:text-heart-400",
        };
      case "delivery":
      case "deliver":
        return {
          icon: Bike,
          bg: "bg-glow-100 dark:bg-glow-900/30",
          text: "text-glow-700 dark:text-glow-400",
          iconColor: "text-glow-600 dark:text-glow-400",
        };
      case "pickup":
        return {
          icon: Store,
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          text: "text-emerald-700 dark:text-emerald-400",
          iconColor: "text-emerald-600 dark:text-emerald-400",
        };
      default:
        return {
          icon: Coffee,
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-700 dark:text-gray-400",
          iconColor: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-heart-500" />
            Pesanan Terbaru
          </CardTitle>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {data?.length || 0} pesanan
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 bg-muted" />
                  <Skeleton className="h-3 w-32 bg-muted" />
                </div>
                <Skeleton className="h-8 w-20 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Belum ada pesanan
            </p>
            <p className="text-xs text-muted-foreground">
              Pesanan terbaru akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.map((order, index) => {
              const orderTypeStyle = getOrderTypeStyle(order.order_type);
              const Icon = orderTypeStyle.icon;

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/manager/orders`)}
                  className={cn(
                    "flex items-center gap-3 p-3 transition-all duration-200",
                    "hover:bg-muted/80 cursor-pointer group",
                    "border-l-2 border-l-transparent hover:border-l-heart-500",
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Order Type Icon with Lucide React */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      orderTypeStyle.bg,
                    )}
                  >
                    <Icon className={cn("w-5 h-5", orderTypeStyle.iconColor)} />
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {order.order_code}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          orderTypeStyle.bg,
                          orderTypeStyle.text,
                        )}
                      >
                        {order.order_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-25">
                          {order.customer}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{order.created_at}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                      {/* <p className="text-sm font-bold text-earth-600 dark:text-earth-400">
                        {formatCurrency(order.total)}
                      </p> */}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-heart-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Footer with view all link */}
      {data && data.length > 0 && (
        <div className="border-t border-border p-2 bg-muted/20">
          <button
            onClick={() => navigate("/manager/orders")}
            className="w-full text-xs text-muted-foreground hover:text-heart-500 transition-colors flex items-center justify-center gap-1 py-1"
          >
            Lihat semua pesanan
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </Card>
  );
}
