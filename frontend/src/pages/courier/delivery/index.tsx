/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, MapPin, Phone, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeliveryStatusBadge } from "@/components/shared/DeliveryStatusBadge";
import { DeliveryStepsCard } from "./components/DeliveryStepsCard";
import { ProofPhotoCapture } from "./components/ProofPhotoCapture";
import { deliveriesApi } from "@/api/deliveries";

export default function CourierDeliveryDetailPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const navigate = useNavigate();
  const [showProof, setShowProof] = useState(false);

  const id = Number(deliveryId);

  const { data, isLoading } = useQuery({
    queryKey: ["courier-delivery-detail", id],
    queryFn: () =>
      deliveriesApi
        .courierList({ per_page: 100 })
        .then((r) => r.data.data.find((d: any) => d.id === id)),
    enabled: !isNaN(id) && id > 0,
    refetchInterval: 10_000,
  });

  if (isNaN(id) || id <= 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Delivery ID tidak valid</p>
        <Button
          variant="outline"
          onClick={() => navigate("/courier/dashboard")}
        >
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Data pengiriman tidak ditemukan</p>
        <Button
          variant="outline"
          onClick={() => navigate("/courier/dashboard")}
        >
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => navigate("/courier/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            {data.order?.order_code}
          </h1>
          <p className="text-muted-foreground text-xs">Detail Pengiriman</p>
        </div>
        <div className="ml-auto">
          <DeliveryStatusBadge status={data.delivery_status} />
        </div>
      </div>

      {/* Customer info */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Info Pelanggan
        </p>
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {data.order?.customer}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.address}
            </p>
            {data.city && (
              <p className="text-xs text-muted-foreground/70">{data.city}</p>
            )}
            {data.delivery_notes && (
              <p className="text-xs text-accent mt-1 italic">
                📝 {data.delivery_notes}
              </p>
            )}
          </div>
          {data.order?.customer_phone && (
            <a
              href={`tel:${data.order.customer_phone}`}
              className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0"
            >
              <Phone className="w-4 h-4 text-blue-400" />
            </a>
          )}
        </div>

        {/* Open in maps */}
        {data.latitude && data.longitude && (
          <a
            href={`https://maps.google.com/?q=${data.latitude},${data.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-600/20 border border-blue-600/30 text-blue-400 text-sm hover:bg-blue-600/30 transition-colors"
          >
            🗺️ Buka di Google Maps
          </a>
        )}
      </div>

      {/* Order items */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Item Pesanan ({data.order?.items_count} item)
        </p>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="w-4 h-4" />
          <span className="text-sm">{data.order?.total}</span>
        </div>
      </div>

      {/* Delivery steps */}
      <DeliveryStepsCard
        delivery={data}
        onUploadProof={() => setShowProof(true)}
      />

      {/* Proof photo display */}
      {data.proof_image_url && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
            Foto Bukti
          </p>
          <div className="rounded-xl overflow-hidden border border-border">
            <img
              src={data.proof_image_url}
              alt="Bukti pengiriman"
              className="w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Proof capture dialog */}
      <ProofPhotoCapture
        delivery={data}
        open={showProof}
        onClose={() => setShowProof(false)}
      />
    </div>
  );
}
