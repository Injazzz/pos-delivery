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
  Store,
  Package,
  Bike,
  Coffee,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data?: RecentOrder[];
  isLoading: boolean;
}

// Mapping yang konsisten dengan OrderTable
const TYPE_LABEL: Record<string, string> = {
  dine_in: "Makan di Tempat",
  take_away: "Bawa Pulang",
  delivery: "Delivery",
};

const TYPE_ICON: Record<string, LucideIcon> = {
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

  // Get order type style yang konsisten dengan OrderTable
  const getOrderTypeStyle = (type: string) => {
    // Debug: log order type dari backend
    // console.log("RecentOrdersTable - order_type received:", type);

    const iconConfig = TYPE_ICON[type];
    const bgConfig = TYPE_BG[type];
    const colorConfig = TYPE_COLOR[type];
    const labelConfig = TYPE_LABEL[type];

    if (!iconConfig) {
      console.warn(`RecentOrdersTable - order_type tidak dikenali: ${type}`);
    }

    return {
      icon: iconConfig || Coffee,
      bg: bgConfig || "bg-muted",
      text: colorConfig || "text-muted-foreground",
      iconColor: colorConfig || "text-muted-foreground",
      label: labelConfig || type,
    };
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
                  {/* Order Type Icon dengan warna konsisten */}
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
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium border",
                          orderTypeStyle.bg,
                          orderTypeStyle.text,
                        )}
                      >
                        {orderTypeStyle.label}
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

                  {/* Status & Total */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                      {/* <p className="text-sm font-bold text-heart-500 dark:text-heart-400 mt-1">
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
