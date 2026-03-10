/* eslint-disable @typescript-eslint/no-explicit-any */

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bike, Clock, CheckCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryStatusBadge } from "@/components/shared/DeliveryStatusBadge";
import { deliveriesApi } from "@/api/deliveries";

export default function CourierDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["courier-deliveries"],
    queryFn: () =>
      deliveriesApi.courierList({ per_page: 20 }).then((r) => r.data),
    refetchInterval: 15_000,
  });

  const active = (data?.data ?? []).filter((d: any) =>
    ["assigned", "picked_up", "on_way"].includes(d.delivery_status),
  );
  const history = (data?.data ?? []).filter((d: any) =>
    ["delivered", "failed"].includes(d.delivery_status),
  );

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Kurir</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pengiriman Anda hari ini
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Aktif",
            value: active.length,
            icon: Bike,
            color: "text-accent",
          },
          {
            label: "Selesai",
            value: history.filter((d: any) => d.delivery_status === "delivered")
              .length,
            icon: CheckCircle,
            color: "text-emerald-400",
          },
          {
            label: "Pending",
            value: (data?.data ?? []).filter(
              (d: any) => d.delivery_status === "pending",
            ).length,
            icon: Clock,
            color: "text-muted-foreground",
          },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              {isLoading ? (
                <Skeleton className="h-6 w-6 bg-muted mx-auto" />
              ) : (
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              )}
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active deliveries */}
      {active.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Bike className="w-4 h-4 text-accent" /> Pengiriman Aktif
          </p>
          <div className="space-y-2">
            {active.map((delivery: any) => (
              <div
                key={delivery.id}
                onClick={() => navigate(`/courier/deliveries/${delivery.id}`)}
                className="bg-accent/10 border border-accent/30 rounded-xl p-4 cursor-pointer hover:bg-accent/15 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {delivery.order?.order_code}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {delivery.address}
                    </p>
                    <p className="text-xs text-accent mt-1">
                      {delivery.order?.customer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <DeliveryStatusBadge status={delivery.delivery_status} />
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No active deliveries */}
      {!isLoading && active.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Bike className="w-10 h-10" />
          <p className="text-sm">Tidak ada pengiriman aktif</p>
          <p className="text-xs">Tunggu penugasan dari manager</p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-3">
            Riwayat Hari Ini
          </p>
          <div className="space-y-2">
            {history.slice(0, 5).map((delivery: any) => (
              <div
                key={delivery.id}
                onClick={() => navigate(`/courier/deliveries/${delivery.id}`)}
                className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:border-border/80 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {delivery.order?.order_code}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {delivery.address}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <DeliveryStatusBadge status={delivery.delivery_status} />
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
