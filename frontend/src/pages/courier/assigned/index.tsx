/* eslint-disable @typescript-eslint/no-explicit-any */

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bike, MapPin, Phone, Package, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryStatusBadge } from "@/components/shared/DeliveryStatusBadge";
import { Button } from "@/components/ui/button";
import { deliveriesApi } from "@/api/deliveries";

export default function CourierAssignedPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["courier-assigned-deliveries"],
    queryFn: () =>
      deliveriesApi.courierList({ per_page: 100 }).then((r) => r.data),
    refetchInterval: 15_000,
  });

  // Filter assigned deliveries (not completed)
  const assigned = (data?.data ?? []).filter((d: any) =>
    ["assigned", "picked_up", "on_way"].includes(d.delivery_status),
  );

  const pending = assigned.filter((d: any) => d.delivery_status === "assigned");
  const inProgress = assigned.filter((d: any) =>
    ["picked_up", "on_way"].includes(d.delivery_status),
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Pesanan Ditugaskan
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Daftar pesanan yang sedang diproses atau dalam perjalanan
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Dipilih
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 bg-muted mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-primary mt-1">
                    {pending.length}
                  </p>
                )}
              </div>
              <Clock className="w-6 h-6 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Dalam Perjalanan
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 bg-muted mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-violet-400 mt-1">
                    {inProgress.length}
                  </p>
                )}
              </div>
              <Bike className="w-6 h-6 text-violet-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-32 bg-muted" />
                <Skeleton className="h-4 w-48 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : assigned.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Bike className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              {" "}
              Tidak ada pesanan yang ditugaskan
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {" "}
              Kembali ke dashboard untuk melihat informasi terbaru{" "}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/courier/dashboard")}
              className="mt-4"
            >
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Pending section */}
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-2 px-1">
                <Clock className="w-3 h-3" /> MENUNGGU DIAMBIL ({pending.length}
                )
              </p>
              <div className="space-y-2">
                {pending.map((delivery: any) => (
                  <DeliveryCard
                    key={delivery.id}
                    delivery={delivery}
                    onNavigate={() =>
                      navigate(`/courier/deliveries/${delivery.id}`)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* In progress section */}
          {inProgress.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-2 px-1">
                <Bike className="w-3 h-3" /> DALAM PERJALANAN (
                {inProgress.length})
              </p>
              <div className="space-y-2">
                {inProgress.map((delivery: any) => (
                  <DeliveryCard
                    key={delivery.id}
                    delivery={delivery}
                    onNavigate={() =>
                      navigate(`/courier/deliveries/${delivery.id}`)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeliveryCard({
  delivery,
  onNavigate,
}: {
  delivery: any;
  onNavigate: () => void;
}) {
  return (
    <button onClick={onNavigate} className="w-full text-left">
      <Card className="bg-card border-border hover:border-primary/30 hover:bg-card/80 transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {delivery.order?.order_code}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {delivery.order?.customer || "Walk-in"}
              </p>
            </div>
            <DeliveryStatusBadge status={delivery.delivery_status} />
          </div>

          {/* Address */}
          <div className="flex gap-2 mb-3">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 line-clamp-2">
              {delivery.address}
            </p>
          </div>

          {/* Phone */}
          <div className="flex gap-2 mb-3">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-sm text-foreground/80">
              {delivery.order?.customer_phone || "-"}
            </p>
          </div>

          {/* Items count and fee */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Package className="w-3 h-3" />
              <p className="text-xs">
                {delivery.order?.items_count || 0} item
                {delivery.order?.items_count !== 1 ? "s" : ""}
              </p>
            </div>
            <p className="text-sm font-semibold text-emerald-400">
              Rp{" "}
              {parseFloat(delivery.delivery_fee || 0).toLocaleString("id-ID")}
            </p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
