// src/pages/manager/dashboard/components/RecentOrdersTable.tsx

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import type { RecentOrder } from "@/types/dashboard";
import type { OrderStatus } from "@/types/order";

interface Props {
  data?: RecentOrder[];
  isLoading: boolean;
}

export function RecentOrdersTable({ data, isLoading }: Props) {
  const navigate = useNavigate();

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm font-semibold">
          Pesanan Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 bg-slate-800 rounded-lg" />
            ))
          : (data ?? []).map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/manager/orders`)}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white">
                      {order.order_code}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      {order.order_type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {order.customer} · {order.created_at}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <OrderStatusBadge status={order.status as OrderStatus} />
                  <span className="text-xs font-bold text-amber-400">
                    {order.total}
                  </span>
                </div>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
