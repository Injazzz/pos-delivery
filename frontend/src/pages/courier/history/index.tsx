/* eslint-disable @typescript-eslint/no-explicit-any */

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Package,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryStatusBadge } from "@/components/shared/DeliveryStatusBadge";
import { Button } from "@/components/ui/button";
import { deliveriesApi } from "@/api/deliveries";

export default function CourierHistoryPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["courier-delivery-history"],
    queryFn: () =>
      deliveriesApi.courierList({ per_page: 100 }).then((r) => r.data),
    refetchInterval: 15_000,
  });

  // Filter completed deliveries
  const history = (data?.data ?? []).filter((d: any) =>
    ["delivered", "failed"].includes(d.delivery_status),
  );

  const delivered = history.filter(
    (d: any) => d.delivery_status === "delivered",
  );
  const failed = history.filter((d: any) => d.delivery_status === "failed");

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Riwayat Pengiriman</h1>
        <p className="text-slate-400 text-sm mt-1">
          Daftar pesanan yang sudah selesai atau gagal dikirim
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Terkirim
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 bg-slate-800 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {delivered.length}
                  </p>
                )}
              </div>
              <CheckCircle className="w-6 h-6 text-emerald-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Gagal
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 bg-slate-800 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-red-400 mt-1">
                    {failed.length}
                  </p>
                )}
              </div>
              <XCircle className="w-6 h-6 text-red-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-slate-900 border-slate-800">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-32 bg-slate-800" />
                <Skeleton className="h-4 w-48 bg-slate-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : history.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">
              Belum ada riwayat pengiriman
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Riwayat pesanan akan muncul di sini setelah pesanan selesai
              dikirim
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
          {/* Delivered section */}
          {delivered.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-2 px-1">
                <CheckCircle className="w-3 h-3" /> TERKIRIM ({delivered.length}
                )
              </p>
              <div className="space-y-2">
                {delivered.map((delivery: any) => (
                  <HistoryCard
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

          {/* Failed section */}
          {failed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-2 px-1">
                <XCircle className="w-3 h-3" /> GAGAL ({failed.length})
              </p>
              <div className="space-y-2">
                {failed.map((delivery: any) => (
                  <HistoryCard
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

function HistoryCard({
  delivery,
  onNavigate,
}: {
  delivery: any;
  onNavigate: () => void;
}) {
  return (
    <button onClick={onNavigate} className="w-full text-left">
      <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                {delivery.order?.order_code}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {delivery.order?.customer || "Walk-in"}
              </p>
            </div>
            <DeliveryStatusBadge status={delivery.delivery_status} />
          </div>

          {/* Address */}
          <div className="flex gap-2 mb-3">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 line-clamp-2">
              {delivery.address}
            </p>
          </div>

          {/* Phone */}
          <div className="flex gap-2 mb-3">
            <Phone className="w-4 h-4 text-slate-500 shrink-0" />
            <p className="text-sm text-slate-300">
              {delivery.order?.customer_phone || "-"}
            </p>
          </div>

          {/* Timestamp */}
          {delivery.delivered_at && (
            <div className="flex gap-2 mb-3">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <p className="text-xs text-slate-400">
                {new Date(delivery.delivered_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          {/* Items count and fee */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1 text-slate-400">
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
